/** 
* Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
* 
* IMPORTANT NOTE: This file is licensed only for use on Apple-branded
* computers and is subject to the terms and conditions of the Apple Software
* License Agreement accompanying the package this file is a part of.
* You may not port this file to another platform without Apple's written consent.
* 
* IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
* of the Apple Software and is subject to the terms and conditions of the Apple
* Software License Agreement accompanying the package this file is part of.
**/

// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Build core namespaces
var CC = CC || new Object();
var CoreCollaboration = CoreCollaboration || CC;
CC.XcodeServer = CC.XcodeServer || new Object();
// Patched for:
// https://prototype.lighthouseapp.com/projects/8886/tickets/289/a/405849/prototypejs.patch

/*  Prototype JavaScript framework, version 1.7
 *  (c) 2005-2010 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/


var Prototype = {

  Version: '1.7',

  Browser: (function(){
    var ua = navigator.userAgent;
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    return {
      IE:             !!window.attachEvent && !isOpera,
      Opera:          isOpera,
      WebKit:         ua.indexOf('AppleWebKit/') > -1,
      Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
      MobileSafari:   /Apple.*Mobile/.test(ua)
    }
  })(),

  BrowserFeatures: {
    XPath: !!document.evaluate,

    SelectorsAPI: !!document.querySelector,

    ElementExtensions: (function() {
      var constructor = window.Element || window.HTMLElement;
      return !!(constructor && constructor.prototype);
    })(),
    SpecificElementExtensions: (function() {
      if (typeof window.HTMLDivElement !== 'undefined')
        return true;

      var div = document.createElement('div'),
          form = document.createElement('form'),
          isSupported = false;

      if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
        isSupported = true;
      }

      div = form = null;

      return isSupported;
    })()
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },

  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;
/* Based on Alex Arnell's inheritance implementation. */

var Class = (function() {

  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      if (p === 'toString') return false;
    }
    return true;
  })();

  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype,
        properties = Object.keys(source);

    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames()[0] == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
(function() {

  var _toString = Object.prototype.toString,
      NULL_TYPE = 'Null',
      UNDEFINED_TYPE = 'Undefined',
      BOOLEAN_TYPE = 'Boolean',
      NUMBER_TYPE = 'Number',
      STRING_TYPE = 'String',
      OBJECT_TYPE = 'Object',
      FUNCTION_CLASS = '[object Function]',
      BOOLEAN_CLASS = '[object Boolean]',
      NUMBER_CLASS = '[object Number]',
      STRING_CLASS = '[object String]',
      ARRAY_CLASS = '[object Array]',
      DATE_CLASS = '[object Date]',
      NATIVE_JSON_STRINGIFY_SUPPORT = window.JSON &&
        typeof JSON.stringify === 'function' &&
        JSON.stringify(0) === '0' &&
        typeof JSON.stringify(Prototype.K) === 'undefined';

  function Type(o) {
    switch(o) {
      case null: return NULL_TYPE;
      case (void 0): return UNDEFINED_TYPE;
    }
    var type = typeof o;
    switch(type) {
      case 'boolean': return BOOLEAN_TYPE;
      case 'number':  return NUMBER_TYPE;
      case 'string':  return STRING_TYPE;
    }
    return OBJECT_TYPE;
  }

  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  function inspect(object) {
    try {
      if (isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  }

  function toJSON(value) {
    return Str('', { '': value }, []);
  }

  function Str(key, holder, stack) {
    var value = holder[key],
        type = typeof value;

    if (Type(value) === OBJECT_TYPE && typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }

    var _class = _toString.call(value);

    switch (_class) {
      case NUMBER_CLASS:
      case BOOLEAN_CLASS:
      case STRING_CLASS:
        value = value.valueOf();
    }

    switch (value) {
      case null: return 'null';
      case true: return 'true';
      case false: return 'false';
    }

    type = typeof value;
    switch (type) {
      case 'string':
        return value.inspect(true);
      case 'number':
        return isFinite(value) ? String(value) : 'null';
      case 'object':

        for (var i = 0, length = stack.length; i < length; i++) {
          if (stack[i] === value) { throw new TypeError(); }
        }
        stack.push(value);

        var partial = [];
        if (_class === ARRAY_CLASS) {
          for (var i = 0, length = value.length; i < length; i++) {
            var str = Str(i, value, stack);
            partial.push(typeof str === 'undefined' ? 'null' : str);
          }
          partial = '[' + partial.join(',') + ']';
        } else {
          var keys = Object.keys(value);
          for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i], str = Str(key, value, stack);
            if (typeof str !== "undefined") {
               partial.push(key.inspect(true)+ ':' + str);
             }
          }
          partial = '{' + partial.join(',') + '}';
        }
        stack.pop();
        return partial;
    }
  }

  function stringify(object) {
    return JSON.stringify(object);
  }

  function toQueryString(object) {
    return $H(object).toQueryString();
  }

  function toHTML(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  }

  function keys(object) {
    if (Type(object) !== OBJECT_TYPE) { throw new TypeError(); }
    var results = [];
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        results.push(property);
      }
    }
    return results;
  }

  function values(object) {
    var results = [];
    for (var property in object)
      results.push(object[property]);
    return results;
  }

  function clone(object) {
    return extend({ }, object);
  }

  function isElement(object) {
    return !!(object && object.nodeType == 1);
  }

  function isArray(object) {
    return _toString.call(object) === ARRAY_CLASS;
  }

  var hasNativeIsArray = (typeof Array.isArray == 'function')
    && Array.isArray([]) && !Array.isArray({});

  if (hasNativeIsArray) {
    isArray = Array.isArray;
  }

  function isHash(object) {
    return object instanceof Hash;
  }

  function isFunction(object) {
    return _toString.call(object) === FUNCTION_CLASS;
  }

  function isString(object) {
    return _toString.call(object) === STRING_CLASS;
  }

  function isNumber(object) {
    return _toString.call(object) === NUMBER_CLASS;
  }

  function isDate(object) {
    return _toString.call(object) === DATE_CLASS;
  }

  function isUndefined(object) {
    return typeof object === "undefined";
  }

  extend(Object, {
    extend:        extend,
    inspect:       inspect,
    toJSON:        NATIVE_JSON_STRINGIFY_SUPPORT ? stringify : toJSON,
    toQueryString: toQueryString,
    toHTML:        toHTML,
    keys:          Object.keys || keys,
    values:        values,
    clone:         clone,
    isElement:     isElement,
    isArray:       isArray,
    isHash:        isHash,
    isFunction:    isFunction,
    isString:      isString,
    isNumber:      isNumber,
    isDate:        isDate,
    isUndefined:   isUndefined
  });
})();
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }

  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  }
})());



(function(proto) {


  function toISOString() {
    return this.getUTCFullYear() + '-' +
      (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
      this.getUTCDate().toPaddedString(2) + 'T' +
      this.getUTCHours().toPaddedString(2) + ':' +
      this.getUTCMinutes().toPaddedString(2) + ':' +
      this.getUTCSeconds().toPaddedString(2) + 'Z';
  }


  function toJSON() {
    return this.toISOString();
  }

  if (!proto.toISOString) proto.toISOString = toISOString;
  if (!proto.toJSON) proto.toJSON = toJSON;

})(Date.prototype);


RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
        this.currentlyExecuting = false;
      } catch(e) {
        this.currentlyExecuting = false;
        throw e;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, (function() {
  var NATIVE_JSON_PARSE_SUPPORT = window.JSON &&
    typeof JSON.parse === 'function' &&
    JSON.parse('{"test": true}').test;

  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }

  function gsub(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);

    if (Object.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }

  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  }

  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  }

  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }

  function strip() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
  }

  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  }

  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img'),
        matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  }

  function evalScripts() {
    return this.extractScripts().map(function(script) { return eval(script) });
  }

  function escapeHTML() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function unescapeHTML() {
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  }


  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift()),
            value = pair.length > 1 ? pair.join('=') : pair[0];

        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  }

  function toArray() {
    return this.split('');
  }

  function succ() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  }

  function times(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  }

  function camelize() {
    return this.replace(/-+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  }

  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  }

  function underscore() {
    return this.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/-/g, '_')
               .toLowerCase();
  }

  function dasherize() {
    return this.replace(/_/g, '-');
  }

  function inspect(useDoubleQuotes) {
    var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
      if (character in String.specialChar) {
        return String.specialChar[character];
      }
      return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  }

  function unfilterJSON(filter) {
    return this.replace(filter || Prototype.JSONFilter, '$1');
  }

  function isJSON() {
    var str = this;
    if (str.blank()) return false;
    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
    str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
    return (/^[\],:{}\s]*$/).test(str);
  }

  function evalJSON(sanitize) {
    var json = this.unfilterJSON(),
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    if (cx.test(json)) {
      json = json.replace(cx, function (a) {
        return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      });
    }
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  }

  function parseJSON() {
    var json = this.unfilterJSON();
    return JSON.parse(json);
  }

  function include(pattern) {
    return this.indexOf(pattern) > -1;
  }

  function startsWith(pattern) {
    return this.lastIndexOf(pattern, 0) === 0;
  }

  function endsWith(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.indexOf(pattern, d) === d;
  }

  function empty() {
    return this == '';
  }

  function blank() {
    return /^\s*$/.test(this);
  }

  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }

  return {
    gsub:           gsub,
    sub:            sub,
    scan:           scan,
    truncate:       truncate,
    strip:          String.prototype.trim || strip,
    stripTags:      stripTags,
    stripScripts:   stripScripts,
    extractScripts: extractScripts,
    evalScripts:    evalScripts,
    escapeHTML:     escapeHTML,
    unescapeHTML:   unescapeHTML,
    toQueryParams:  toQueryParams,
    parseQuery:     toQueryParams,
    toArray:        toArray,
    succ:           succ,
    times:          times,
    camelize:       camelize,
    capitalize:     capitalize,
    underscore:     underscore,
    dasherize:      dasherize,
    inspect:        inspect,
    unfilterJSON:   unfilterJSON,
    isJSON:         isJSON,
    evalJSON:       NATIVE_JSON_PARSE_SUPPORT ? parseJSON : evalJSON,
    include:        include,
    startsWith:     startsWith,
    endsWith:       endsWith,
    empty:          empty,
    blank:          blank,
    interpolate:    interpolate
  };
})());

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return (match[1] + '');

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3],
          pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;

      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = (function() {
  function each(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  }

  function eachSlice(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  }

  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  }

  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  }

  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  }

  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(RegExp.escape(filter));

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function include(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  }

  function inGroupsOf(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  }

  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  }

  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  }

  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  }

  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  }

  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  }

  function pluck(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  }

  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  }

  function toArray() {
    return this.map();
  }

  function zip() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  }

  function size() {
    return this.toArray().length;
  }

  function inspect() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }









  return {
    each:       each,
    eachSlice:  eachSlice,
    all:        all,
    every:      all,
    any:        any,
    some:       any,
    collect:    collect,
    map:        collect,
    detect:     detect,
    findAll:    findAll,
    select:     findAll,
    filter:     findAll,
    grep:       grep,
    include:    include,
    member:     include,
    inGroupsOf: inGroupsOf,
    inject:     inject,
    invoke:     invoke,
    max:        max,
    min:        min,
    partition:  partition,
    pluck:      pluck,
    reject:     reject,
    sortBy:     sortBy,
    toArray:    toArray,
    entries:    toArray,
    zip:        zip,
    size:       size,
    inspect:    inspect,
    find:       detect
  };
})();

function $A(iterable) {
  if (!iterable) return [];
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}


function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

Array.from = $A;


(function() {
  var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available

  function each(iterator, context) {
    for (var i = 0, length = this.length >>> 0; i < length; i++) {
      if (i in this) iterator.call(context, this[i], i, this);
    }
  }
  if (!_each) _each = each;

  function clear() {
    this.length = 0;
    return this;
  }

  function first() {
    return this[0];
  }

  function last() {
    return this[this.length - 1];
  }

  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  function flatten() {
    return this.inject([], function(array, value) {
      if (Object.isArray(value))
        return array.concat(value.flatten());
      array.push(value);
      return array;
    });
  }

  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  function reverse(inline) {
    return (inline === false ? this.toArray() : this)._reverse();
  }

  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  }

  function intersect(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  }


  function clone() {
    return slice.call(this, 0);
  }

  function size() {
    return this.length;
  }

  function inspect() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }

  function indexOf(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) i = length + i;
    for (; i < length; i++)
      if (this[i] === item) return i;
    return -1;
  }

  function lastIndexOf(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
  }

  function concat() {
    var array = slice.call(this, 0), item;
    for (var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];
      if (Object.isArray(item) && !('callee' in item)) {
        for (var j = 0, arrayLength = item.length; j < arrayLength; j++)
          array.push(item[j]);
      } else {
        array.push(item);
      }
    }
    return array;
  }

  Object.extend(arrayProto, Enumerable);

  if (!arrayProto._reverse)
    arrayProto._reverse = arrayProto.reverse;

  Object.extend(arrayProto, {
    _each:     _each,
    clear:     clear,
    first:     first,
    last:      last,
    compact:   compact,
    flatten:   flatten,
    without:   without,
    reverse:   reverse,
    uniq:      uniq,
    intersect: intersect,
    clone:     clone,
    toArray:   clone,
    size:      size,
    inspect:   inspect
  });

  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2)

  if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;

  if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
  if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  }


  function _each(iterator) {
    for (var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  }

  function set(key, value) {
    return this._object[key] = value;
  }

  function get(key) {
    if (this._object[key] !== Object.prototype[key])
      return this._object[key];
  }

  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  }

  function toObject() {
    return Object.clone(this._object);
  }



  function keys() {
    return this.pluck('key');
  }

  function values() {
    return this.pluck('value');
  }

  function index(value) {
    var match = this.detect(function(pair) {
      return pair.value === value;
    });
    return match && match.key;
  }

  function merge(object) {
    return this.clone().update(object);
  }

  function update(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result;
    });
  }

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;

      if (values && typeof values == 'object') {
        if (Object.isArray(values)) {
          var queryValues = [];
          for (var i = 0, len = values.length, value; i < len; i++) {
            value = values[i];
            queryValues.push(toQueryPair(key, value));
          }
          return results.concat(queryValues);
        }
      } else results.push(toQueryPair(key, values));
      return results;
    }).join('&');
  }

  function inspect() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }

  function clone() {
    return new Hash(this);
  }

  return {
    initialize:             initialize,
    _each:                  _each,
    set:                    set,
    get:                    get,
    unset:                  unset,
    toObject:               toObject,
    toTemplateReplacements: toObject,
    keys:                   keys,
    values:                 values,
    index:                  index,
    merge:                  merge,
    update:                 update,
    toQueryString:          toQueryString,
    inspect:                inspect,
    toJSON:                 toObject,
    clone:                  clone
  };
})());

Hash.from = $H;
Object.extend(Number.prototype, (function() {
  function toColorPart() {
    return this.toPaddedString(2, 16);
  }

  function succ() {
    return this + 1;
  }

  function times(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  }

  function toPaddedString(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  }

  function abs() {
    return Math.abs(this);
  }

  function round() {
    return Math.round(this);
  }

  function ceil() {
    return Math.ceil(this);
  }

  function floor() {
    return Math.floor(this);
  }

  return {
    toColorPart:    toColorPart,
    succ:           succ,
    times:          times,
    toPaddedString: toPaddedString,
    abs:            abs,
    round:          round,
    ceil:           ceil,
    floor:          floor
  };
})());

function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function() {
  function initialize(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  }

  function _each(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  }

  function include(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }

  return {
    initialize: initialize,
    _each:      _each,
    include:    include
  };
})());



var Abstract = { };


var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});
Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});
Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.isString(this.options.parameters) ?
          this.options.parameters :
          Object.toQueryString(this.options.parameters);

    if (params && this.method === 'get') {
      this.url += (this.url.include('?') ? '&' : '?') + params;
    }

    this.parameters = params.toQueryParams();

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : this.options.postBody;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (['post', 'put'].include(this.method)) {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300) || status == 304;
  },

  getStatus: function() {
    try {
      if (this.transport.status === 1223) return 204;
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null; }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];








Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if ((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if (readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,

  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});


function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}



(function(global) {
  function shouldUseCache(tagName, attributes) {
    if (tagName === 'select') return false;
    if ('type' in attributes) return false;
    return true;
  }

  var HAS_EXTENDED_CREATE_ELEMENT_SYNTAX = (function(){
    try {
      var el = document.createElement('<input name="x">');
      return el.tagName.toLowerCase() === 'input' && el.name === 'x';
    }
    catch(err) {
      return false;
    }
  })();

  var element = global.Element;

  global.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;

    if (HAS_EXTENDED_CREATE_ELEMENT_SYNTAX && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }

    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));

    var node = shouldUseCache(tagName, attributes) ?
     cache[tagName].cloneNode(false) : document.createElement(tagName);

    return Element.writeAttribute(node, attributes);
  };

  Object.extend(global.Element, element || { });
  if (element) global.Element.prototype = element.prototype;

})(this);

Element.idCounter = 1;
Element.cache = { };

Element._purgeElement = function(element) {
  var uid = element._prototypeUID;
  if (uid) {
    Element.stopObserving(element);
    element._prototypeUID = void 0;
    delete Element.Storage[uid];
  }
}

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: (function(){

    var SELECT_ELEMENT_INNERHTML_BUGGY = (function(){
      var el = document.createElement("select"),
          isBuggy = true;
      el.innerHTML = "<option value=\"test\">test</option>";
      if (el.options && el.options[0]) {
        isBuggy = el.options[0].nodeName.toUpperCase() !== "OPTION";
      }
      el = null;
      return isBuggy;
    })();

    var TABLE_ELEMENT_INNERHTML_BUGGY = (function(){
      try {
        var el = document.createElement("table");
        if (el && el.tBodies) {
          el.innerHTML = "<tbody><tr><td>test</td></tr></tbody>";
          var isBuggy = typeof el.tBodies[0] == "undefined";
          el = null;
          return isBuggy;
        }
      } catch (e) {
        return true;
      }
    })();

    var LINK_ELEMENT_INNERHTML_BUGGY = (function() {
      try {
        var el = document.createElement('div');
        el.innerHTML = "<link>";
        var isBuggy = (el.childNodes.length === 0);
        el = null;
        return isBuggy;
      } catch(e) {
        return true;
      }
    })();

    var ANY_INNERHTML_BUGGY = SELECT_ELEMENT_INNERHTML_BUGGY ||
     TABLE_ELEMENT_INNERHTML_BUGGY || LINK_ELEMENT_INNERHTML_BUGGY;

    var SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (function () {
      var s = document.createElement("script"),
          isBuggy = false;
      try {
        s.appendChild(document.createTextNode(""));
        isBuggy = !s.firstChild ||
          s.firstChild && s.firstChild.nodeType !== 3;
      } catch (e) {
        isBuggy = true;
      }
      s = null;
      return isBuggy;
    })();


    function update(element, content) {
      element = $(element);
      var purgeElement = Element._purgeElement;

      var descendants = element.getElementsByTagName('*'),
       i = descendants.length;
      while (i--) purgeElement(descendants[i]);

      if (content && content.toElement)
        content = content.toElement();

      if (Object.isElement(content))
        return element.update().insert(content);

      content = Object.toHTML(content);

      var tagName = element.tagName.toUpperCase();

      if (tagName === 'SCRIPT' && SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING) {
        element.text = content;
        return element;
      }

      if (ANY_INNERHTML_BUGGY) {
        if (tagName in Element._insertionTranslations.tags) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          Element._getContentFromAnonymousElement(tagName, content.stripScripts())
            .each(function(node) {
              element.appendChild(node)
            });
        } else if (LINK_ELEMENT_INNERHTML_BUGGY && Object.isString(content) && content.indexOf('<link') > -1) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          var nodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts(), true);
          nodes.each(function(node) { element.appendChild(node) });
        }
        else {
          element.innerHTML = content.stripScripts();
        }
      }
      else {
        element.innerHTML = content.stripScripts();
      }

      content.evalScripts.bind(content).defer();
      return element;
    }

    return update;
  })(),

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(),
          attribute = pair.last(),
          value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property, maximumLength) {
    element = $(element);
    maximumLength = maximumLength || -1;
    var elements = [];

    while (element = element[property]) {
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
      if (elements.length == maximumLength)
        break;
    }

    return elements;
  },

  ancestors: function(element) {
    return Element.recursivelyCollect(element, 'parentNode');
  },

  descendants: function(element) {
    return Element.select(element, "*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    var results = [], child = $(element).firstChild;
    while (child) {
      if (child.nodeType === 1) {
        results.push(Element.extend(child));
      }
      child = child.nextSibling;
    }
    return results;
  },

  previousSiblings: function(element, maximumLength) {
    return Element.recursivelyCollect(element, 'previousSibling');
  },

  nextSiblings: function(element) {
    return Element.recursivelyCollect(element, 'nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return Element.previousSiblings(element).reverse()
      .concat(Element.nextSiblings(element));
  },

  match: function(element, selector) {
    element = $(element);
    if (Object.isString(selector))
      return Prototype.Selector.match(element, selector);
    return selector.match(element);
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = Element.ancestors(element);
    return Object.isNumber(expression) ? ancestors[expression] :
      Prototype.Selector.find(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return Element.firstDescendant(element);
    return Object.isNumber(expression) ? Element.descendants(element)[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (Object.isNumber(expression)) index = expression, expression = false;
    if (!Object.isNumber(index)) index = 0;

    if (expression) {
      return Prototype.Selector.find(element.previousSiblings(), expression, index);
    } else {
      return element.recursivelyCollect("previousSibling", index + 1)[index];
    }
  },

  next: function(element, expression, index) {
    element = $(element);
    if (Object.isNumber(expression)) index = expression, expression = false;
    if (!Object.isNumber(index)) index = 0;

    if (expression) {
      return Prototype.Selector.find(element.nextSiblings(), expression, index);
    } else {
      var maximumLength = Object.isNumber(index) ? index + 1 : 1;
      return element.recursivelyCollect("nextSibling", index + 1)[index];
    }
  },


  select: function(element) {
    element = $(element);
    var expressions = Array.prototype.slice.call(arguments, 1).join(', ');
    return Prototype.Selector.select(expressions, element);
  },

  adjacent: function(element) {
    element = $(element);
    var expressions = Array.prototype.slice.call(arguments, 1).join(', ');
    return Prototype.Selector.select(expressions, element.parentNode).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = Element.readAttribute(element, 'id');
    if (id) return id;
    do { id = 'anonymous_element_' + Element.idCounter++ } while ($(id));
    Element.writeAttribute(element, 'id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return Element.getDimensions(element).height;
  },

  getWidth: function(element) {
    return Element.getDimensions(element).width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!Element.hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element[Element.hasClassName(element, className) ?
      'removeClassName' : 'addClassName'](element, className);
  },

  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = Element.cumulativeOffset(element);
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    source = $(source);
    var p = Element.viewportOffset(source), delta = [0, 0], parent = null;

    element = $(element);

    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = Element.getOffsetParent(element);
      delta = Element.viewportOffset(parent);
    }

    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,

  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'height': case 'width':
          if (!Element.visible(element)) return null;

          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = (function(){

    var classProp = 'className',
        forProp = 'for',
        el = document.createElement('div');

    el.setAttribute(classProp, 'x');

    if (el.className !== 'x') {
      el.setAttribute('class', 'x');
      if (el.className === 'x') {
        classProp = 'class';
      }
    }
    el = null;

    el = document.createElement('label');
    el.setAttribute(forProp, 'x');
    if (el.htmlFor !== 'x') {
      el.setAttribute('htmlFor', 'x');
      if (el.htmlFor === 'x') {
        forProp = 'htmlFor';
      }
    }
    el = null;

    return {
      read: {
        names: {
          'class':      classProp,
          'className':  classProp,
          'for':        forProp,
          'htmlFor':    forProp
        },
        values: {
          _getAttr: function(element, attribute) {
            return element.getAttribute(attribute);
          },
          _getAttr2: function(element, attribute) {
            return element.getAttribute(attribute, 2);
          },
          _getAttrNode: function(element, attribute) {
            var node = element.getAttributeNode(attribute);
            return node ? node.value : "";
          },
          _getEv: (function(){

            var el = document.createElement('div'), f;
            el.onclick = Prototype.emptyFunction;
            var value = el.getAttribute('onclick');

            if (String(value).indexOf('{') > -1) {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                attribute = attribute.toString();
                attribute = attribute.split('{')[1];
                attribute = attribute.split('}')[0];
                return attribute.strip();
              };
            }
            else if (value === '') {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                return attribute.strip();
              };
            }
            el = null;
            return f;
          })(),
          _flag: function(element, attribute) {
            return $(element).hasAttribute(attribute) ? attribute : null;
          },
          style: function(element) {
            return element.style.cssText.toLowerCase();
          },
          title: function(element) {
            return element.title;
          }
        }
      }
    }
  })();

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr2,
      src:         v._getAttr2,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);

  if (Prototype.BrowserFeatures.ElementExtensions) {
    (function() {
      function _descendants(element) {
        var nodes = element.getElementsByTagName('*'), results = [];
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName !== "!") // Filter out comment nodes.
            results.push(node);
        return results;
      }

      Element.Methods.down = function(element, expression, index) {
        element = $(element);
        if (arguments.length == 1) return element.firstDescendant();
        return Object.isNumber(expression) ? _descendants(element)[expression] :
          Element.select(element, expression)[index || 0];
      }
    })();
  }

}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if (element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };
}

if ('outerHTML' in document.documentElement) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next(),
          fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html, force) {
  var div = new Element('div'),
      t = Element._insertionTranslations.tags[tagName];

  var workaround = false;
  if (t) workaround = true;
  else if (force) {
    workaround = true;
    t = ['', '', 0];
  }

  if (workaround) {
    div.innerHTML = '&nbsp;' + t[0] + html + t[1];
    div.removeChild(div.firstChild);
    for (var i = t[2]; i--; ) {
      div = div.firstChild;
    }
  }
  else {
    div.innerHTML = html;
  }
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  var tags = Element._insertionTranslations.tags;
  Object.extend(tags, {
    THEAD: tags.TBODY,
    TFOOT: tags.TBODY,
    TH:    tags.TD
  });
})();

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

(function(div) {

  if (!Prototype.BrowserFeatures.ElementExtensions && div['__proto__']) {
    window.HTMLElement = { };
    window.HTMLElement.prototype = div['__proto__'];
    Prototype.BrowserFeatures.ElementExtensions = true;
  }

  div = null;

})(document.createElement('div'));

Element.extend = (function() {

  function checkDeficiency(tagName) {
    if (typeof window.Element != 'undefined') {
      var proto = window.Element.prototype;
      if (proto) {
        var id = '_' + (Math.random()+'').slice(2),
            el = document.createElement(tagName);
        proto[id] = 'x';
        var isBuggy = (el[id] !== 'x');
        delete proto[id];
        el = null;
        return isBuggy;
      }
    }
    return false;
  }

  function extendElementWith(element, methods) {
    for (var property in methods) {
      var value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }
  }

  var HTMLOBJECTELEMENT_PROTOTYPE_BUGGY = checkDeficiency('object');

  if (Prototype.BrowserFeatures.SpecificElementExtensions) {
    if (HTMLOBJECTELEMENT_PROTOTYPE_BUGGY) {
      return function(element) {
        if (element && typeof element._extendedByPrototype == 'undefined') {
          var t = element.tagName;
          if (t && (/^(?:object|applet|embed)$/i.test(t))) {
            extendElementWith(element, Element.Methods);
            extendElementWith(element, Element.Methods.Simulated);
            extendElementWith(element, Element.Methods.ByTag[t.toUpperCase()]);
          }
        }
        return element;
      }
    }
    return Prototype.K;
  }

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || typeof element._extendedByPrototype != 'undefined' ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
        tagName = element.tagName.toUpperCase();

    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    extendElementWith(element, methods);

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

if (document.documentElement.hasAttribute) {
  Element.hasAttribute = function(element, attribute) {
    return element.hasAttribute(attribute);
  };
}
else {
  Element.hasAttribute = Element.Methods.Simulated.hasAttribute;
}

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods),
      "BUTTON":   Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    var element = document.createElement(tagName),
        proto = element['__proto__'] || element.constructor.prototype;

    element = null;
    return proto;
  }

  var elementPrototype = window.HTMLElement ? HTMLElement.prototype :
   Element.prototype;

  if (F.ElementExtensions) {
    copy(Element.Methods, elementPrototype);
    copy(Element.Methods.Simulated, elementPrototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};


document.viewport = {

  getDimensions: function() {
    return { width: this.getWidth(), height: this.getHeight() };
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop);
  }
};

(function(viewport) {
  var B = Prototype.Browser, doc = document, element, property = {};

  function getRootElement() {
    if (B.WebKit && !doc.evaluate)
      return document;

    if (B.Opera && window.parseFloat(window.opera.version()) < 9.5)
      return document.body;

    return document.documentElement;
  }

  function define(D) {
    if (!element) element = getRootElement();

    property[D] = 'client' + D;

    viewport['get' + D] = function() { return element[property[D]] };
    return viewport['get' + D]();
  }

  viewport.getWidth  = define.curry('Width');

  viewport.getHeight = define.curry('Height');
})(document.viewport);


Element.Storage = {
  UID: 1
};

Element.addMethods({
  getStorage: function(element) {
    if (!(element = $(element))) return;

    var uid;
    if (element === window) {
      uid = 0;
    } else {
      if (typeof element._prototypeUID === "undefined")
        element._prototypeUID = Element.Storage.UID++;
      uid = element._prototypeUID;
    }

    if (!Element.Storage[uid])
      Element.Storage[uid] = $H();

    return Element.Storage[uid];
  },

  store: function(element, key, value) {
    if (!(element = $(element))) return;

    if (arguments.length === 2) {
      Element.getStorage(element).update(key);
    } else {
      Element.getStorage(element).set(key, value);
    }

    return element;
  },

  retrieve: function(element, key, defaultValue) {
    if (!(element = $(element))) return;
    var hash = Element.getStorage(element), value = hash.get(key);

    if (Object.isUndefined(value)) {
      hash.set(key, defaultValue);
      value = defaultValue;
    }

    return value;
  },

  clone: function(element, deep) {
    if (!(element = $(element))) return;
    var clone = element.cloneNode(deep);
    clone._prototypeUID = void 0;
    if (deep) {
      var descendants = Element.select(clone, '*'),
          i = descendants.length;
      while (i--) {
        descendants[i]._prototypeUID = void 0;
      }
    }
    return Element.extend(clone);
  },

  purge: function(element) {
    if (!(element = $(element))) return;
    var purgeElement = Element._purgeElement;

    purgeElement(element);

    var descendants = element.getElementsByTagName('*'),
     i = descendants.length;

    while (i--) purgeElement(descendants[i]);

    return null;
  }
});

(function() {

  function toDecimal(pctString) {
    var match = pctString.match(/^(\d+)%?$/i);
    if (!match) return null;
    return (Number(match[1]) / 100);
  }

  function getPixelValue(value, property, context) {
    var element = null;
    if (Object.isElement(value)) {
      element = value;
      value = element.getStyle(property);
    }

    if (value === null) {
      return null;
    }

    if ((/^(?:-)?\d+(\.\d+)?(px)?$/i).test(value)) {
      return window.parseFloat(value);
    }

    var isPercentage = value.include('%'), isViewport = (context === document.viewport);

    if (/\d/.test(value) && element && element.runtimeStyle && !(isPercentage && isViewport)) {
      var style = element.style.left, rStyle = element.runtimeStyle.left;
      element.runtimeStyle.left = element.currentStyle.left;
      element.style.left = value || 0;
      value = element.style.pixelLeft;
      element.style.left = style;
      element.runtimeStyle.left = rStyle;

      return value;
    }

    if (element && isPercentage) {
      context = context || element.parentNode;
      var decimal = toDecimal(value);
      var whole = null;
      var position = element.getStyle('position');

      var isHorizontal = property.include('left') || property.include('right') ||
       property.include('width');

      var isVertical =  property.include('top') || property.include('bottom') ||
        property.include('height');

      if (context === document.viewport) {
        if (isHorizontal) {
          whole = document.viewport.getWidth();
        } else if (isVertical) {
          whole = document.viewport.getHeight();
        }
      } else {
        if (isHorizontal) {
          whole = $(context).measure('width');
        } else if (isVertical) {
          whole = $(context).measure('height');
        }
      }

      return (whole === null) ? 0 : whole * decimal;
    }

    return 0;
  }

  function toCSSPixels(number) {
    if (Object.isString(number) && number.endsWith('px')) {
      return number;
    }
    return number + 'px';
  }

  function isDisplayed(element) {
    var originalElement = element;
    while (element && element.parentNode) {
      var display = element.getStyle('display');
      if (display === 'none') {
        return false;
      }
      element = $(element.parentNode);
    }
    return true;
  }

  var hasLayout = Prototype.K;
  if ('currentStyle' in document.documentElement) {
    hasLayout = function(element) {
      if (!element.currentStyle.hasLayout) {
        element.style.zoom = 1;
      }
      return element;
    };
  }

  function cssNameFor(key) {
    if (key.include('border')) key = key + '-width';
    return key.camelize();
  }

  Element.Layout = Class.create(Hash, {
    initialize: function($super, element, preCompute) {
      $super();
      this.element = $(element);

      Element.Layout.PROPERTIES.each( function(property) {
        this._set(property, null);
      }, this);

      if (preCompute) {
        this._preComputing = true;
        this._begin();
        Element.Layout.PROPERTIES.each( this._compute, this );
        this._end();
        this._preComputing = false;
      }
    },

    _set: function(property, value) {
      return Hash.prototype.set.call(this, property, value);
    },

    set: function(property, value) {
      throw "Properties of Element.Layout are read-only.";
    },

    get: function($super, property) {
      var value = $super(property);
      return value === null ? this._compute(property) : value;
    },

    _begin: function() {
      if (this._prepared) return;

      var element = this.element;
      if (isDisplayed(element)) {
        this._prepared = true;
        return;
      }

      var originalStyles = {
        position:   element.style.position   || '',
        width:      element.style.width      || '',
        visibility: element.style.visibility || '',
        display:    element.style.display    || ''
      };

      element.store('prototype_original_styles', originalStyles);

      var position = element.getStyle('position'),
       width = element.getStyle('width');

      if (width === "0px" || width === null) {
        element.style.display = 'block';
        width = element.getStyle('width');
      }

      var context = (position === 'fixed') ? document.viewport :
       element.parentNode;

      element.setStyle({
        position:   'absolute',
        visibility: 'hidden',
        display:    'block'
      });

      var positionedWidth = element.getStyle('width');

      var newWidth;
      if (width && (positionedWidth === width)) {
        newWidth = getPixelValue(element, 'width', context);
      } else if (position === 'absolute' || position === 'fixed') {
        newWidth = getPixelValue(element, 'width', context);
      } else {
        var parent = element.parentNode, pLayout = $(parent).getLayout();

        newWidth = pLayout.get('width') -
         this.get('margin-left') -
         this.get('border-left') -
         this.get('padding-left') -
         this.get('padding-right') -
         this.get('border-right') -
         this.get('margin-right');
      }

      element.setStyle({ width: newWidth + 'px' });

      this._prepared = true;
    },

    _end: function() {
      var element = this.element;
      var originalStyles = element.retrieve('prototype_original_styles');
      element.store('prototype_original_styles', null);
      element.setStyle(originalStyles);
      this._prepared = false;
    },

    _compute: function(property) {
      var COMPUTATIONS = Element.Layout.COMPUTATIONS;
      if (!(property in COMPUTATIONS)) {
        throw "Property not found.";
      }

      return this._set(property, COMPUTATIONS[property].call(this, this.element));
    },

    toObject: function() {
      var args = $A(arguments);
      var keys = (args.length === 0) ? Element.Layout.PROPERTIES :
       args.join(' ').split(' ');
      var obj = {};
      keys.each( function(key) {
        if (!Element.Layout.PROPERTIES.include(key)) return;
        var value = this.get(key);
        if (value != null) obj[key] = value;
      }, this);
      return obj;
    },

    toHash: function() {
      var obj = this.toObject.apply(this, arguments);
      return new Hash(obj);
    },

    toCSS: function() {
      var args = $A(arguments);
      var keys = (args.length === 0) ? Element.Layout.PROPERTIES :
       args.join(' ').split(' ');
      var css = {};

      keys.each( function(key) {
        if (!Element.Layout.PROPERTIES.include(key)) return;
        if (Element.Layout.COMPOSITE_PROPERTIES.include(key)) return;

        var value = this.get(key);
        if (value != null) css[cssNameFor(key)] = value + 'px';
      }, this);
      return css;
    },

    inspect: function() {
      return "#<Element.Layout>";
    }
  });

  Object.extend(Element.Layout, {
    PROPERTIES: $w('height width top left right bottom border-left border-right border-top border-bottom padding-left padding-right padding-top padding-bottom margin-top margin-bottom margin-left margin-right padding-box-width padding-box-height border-box-width border-box-height margin-box-width margin-box-height'),

    COMPOSITE_PROPERTIES: $w('padding-box-width padding-box-height margin-box-width margin-box-height border-box-width border-box-height'),

    COMPUTATIONS: {
      'height': function(element) {
        if (!this._preComputing) this._begin();

        var bHeight = this.get('border-box-height');
        if (bHeight <= 0) {
          if (!this._preComputing) this._end();
          return 0;
        }

        var bTop = this.get('border-top'),
         bBottom = this.get('border-bottom');

        var pTop = this.get('padding-top'),
         pBottom = this.get('padding-bottom');

        if (!this._preComputing) this._end();

        return bHeight - bTop - bBottom - pTop - pBottom;
      },

      'width': function(element) {
        if (!this._preComputing) this._begin();

        var bWidth = this.get('border-box-width');
        if (bWidth <= 0) {
          if (!this._preComputing) this._end();
          return 0;
        }

        var bLeft = this.get('border-left'),
         bRight = this.get('border-right');

        var pLeft = this.get('padding-left'),
         pRight = this.get('padding-right');

        if (!this._preComputing) this._end();

        return bWidth - bLeft - bRight - pLeft - pRight;
      },

      'padding-box-height': function(element) {
        var height = this.get('height'),
         pTop = this.get('padding-top'),
         pBottom = this.get('padding-bottom');

        return height + pTop + pBottom;
      },

      'padding-box-width': function(element) {
        var width = this.get('width'),
         pLeft = this.get('padding-left'),
         pRight = this.get('padding-right');

        return width + pLeft + pRight;
      },

      'border-box-height': function(element) {
        if (!this._preComputing) this._begin();
        var height = element.offsetHeight;
        if (!this._preComputing) this._end();
        return height;
      },

      'border-box-width': function(element) {
        if (!this._preComputing) this._begin();
        var width = element.offsetWidth;
        if (!this._preComputing) this._end();
        return width;
      },

      'margin-box-height': function(element) {
        var bHeight = this.get('border-box-height'),
         mTop = this.get('margin-top'),
         mBottom = this.get('margin-bottom');

        if (bHeight <= 0) return 0;

        return bHeight + mTop + mBottom;
      },

      'margin-box-width': function(element) {
        var bWidth = this.get('border-box-width'),
         mLeft = this.get('margin-left'),
         mRight = this.get('margin-right');

        if (bWidth <= 0) return 0;

        return bWidth + mLeft + mRight;
      },

      'top': function(element) {
        var offset = element.positionedOffset();
        return offset.top;
      },

      'bottom': function(element) {
        var offset = element.positionedOffset(),
         parent = element.getOffsetParent(),
         pHeight = parent.measure('height');

        var mHeight = this.get('border-box-height');

        return pHeight - mHeight - offset.top;
      },

      'left': function(element) {
        var offset = element.positionedOffset();
        return offset.left;
      },

      'right': function(element) {
        var offset = element.positionedOffset(),
         parent = element.getOffsetParent(),
         pWidth = parent.measure('width');

        var mWidth = this.get('border-box-width');

        return pWidth - mWidth - offset.left;
      },

      'padding-top': function(element) {
        return getPixelValue(element, 'paddingTop');
      },

      'padding-bottom': function(element) {
        return getPixelValue(element, 'paddingBottom');
      },

      'padding-left': function(element) {
        return getPixelValue(element, 'paddingLeft');
      },

      'padding-right': function(element) {
        return getPixelValue(element, 'paddingRight');
      },

      'border-top': function(element) {
        return getPixelValue(element, 'borderTopWidth');
      },

      'border-bottom': function(element) {
        return getPixelValue(element, 'borderBottomWidth');
      },

      'border-left': function(element) {
        return getPixelValue(element, 'borderLeftWidth');
      },

      'border-right': function(element) {
        return getPixelValue(element, 'borderRightWidth');
      },

      'margin-top': function(element) {
        return getPixelValue(element, 'marginTop');
      },

      'margin-bottom': function(element) {
        return getPixelValue(element, 'marginBottom');
      },

      'margin-left': function(element) {
        return getPixelValue(element, 'marginLeft');
      },

      'margin-right': function(element) {
        return getPixelValue(element, 'marginRight');
      }
    }
  });

  if ('getBoundingClientRect' in document.documentElement) {
    Object.extend(Element.Layout.COMPUTATIONS, {
      'right': function(element) {
        var parent = hasLayout(element.getOffsetParent());
        var rect = element.getBoundingClientRect(),
         pRect = parent.getBoundingClientRect();

        return (pRect.right - rect.right).round();
      },

      'bottom': function(element) {
        var parent = hasLayout(element.getOffsetParent());
        var rect = element.getBoundingClientRect(),
         pRect = parent.getBoundingClientRect();

        return (pRect.bottom - rect.bottom).round();
      }
    });
  }

  Element.Offset = Class.create({
    initialize: function(left, top) {
      this.left = left.round();
      this.top  = top.round();

      this[0] = this.left;
      this[1] = this.top;
    },

    relativeTo: function(offset) {
      return new Element.Offset(
        this.left - offset.left,
        this.top  - offset.top
      );
    },

    inspect: function() {
      return "#<Element.Offset left: #{left} top: #{top}>".interpolate(this);
    },

    toString: function() {
      return "[#{left}, #{top}]".interpolate(this);
    },

    toArray: function() {
      return [this.left, this.top];
    }
  });

  function getLayout(element, preCompute) {
    return new Element.Layout(element, preCompute);
  }

  function measure(element, property) {
    return $(element).getLayout().get(property);
  }

  function getDimensions(element) {
    element = $(element);
    var display = Element.getStyle(element, 'display');

    if (display && display !== 'none') {
      return { width: element.offsetWidth, height: element.offsetHeight };
    }

    var style = element.style;
    var originalStyles = {
      visibility: style.visibility,
      position:   style.position,
      display:    style.display
    };

    var newStyles = {
      visibility: 'hidden',
      display:    'block'
    };

    if (originalStyles.position !== 'fixed')
      newStyles.position = 'absolute';

    Element.setStyle(element, newStyles);

    var dimensions = {
      width:  element.offsetWidth,
      height: element.offsetHeight
    };

    Element.setStyle(element, originalStyles);

    return dimensions;
  }

  function getOffsetParent(element) {
    element = $(element);

    if (isDocument(element) || isDetached(element) || isBody(element) || isHtml(element))
      return $(document.body);

    var isInline = (Element.getStyle(element, 'display') === 'inline');
    if (!isInline && element.offsetParent) return $(element.offsetParent);

    while ((element = element.parentNode) && element !== document.body) {
      if (Element.getStyle(element, 'position') !== 'static') {
        return isHtml(element) ? $(document.body) : $(element);
      }
    }

    return $(document.body);
  }


  function cumulativeOffset(element) {
    element = $(element);
    var valueT = 0, valueL = 0;
    if (element.parentNode) {
      do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
      } while (element);
    }
    return new Element.Offset(valueL, valueT);
  }

  function positionedOffset(element) {
    element = $(element);

    var layout = element.getLayout();

    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (isBody(element)) break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);

    valueL -= layout.get('margin-top');
    valueT -= layout.get('margin-left');

    return new Element.Offset(valueL, valueT);
  }

  function cumulativeScrollOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return new Element.Offset(valueL, valueT);
  }

  function viewportOffset(forElement) {
    element = $(element);
    var valueT = 0, valueL = 0, docBody = document.body;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == docBody &&
        Element.getStyle(element, 'position') == 'absolute') break;
    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (element != docBody) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);
    return new Element.Offset(valueL, valueT);
  }

  function absolutize(element) {
    element = $(element);

    if (Element.getStyle(element, 'position') === 'absolute') {
      return element;
    }

    var offsetParent = getOffsetParent(element);
    var eOffset = element.viewportOffset(),
     pOffset = offsetParent.viewportOffset();

    var offset = eOffset.relativeTo(pOffset);
    var layout = element.getLayout();

    element.store('prototype_absolutize_original_styles', {
      left:   element.getStyle('left'),
      top:    element.getStyle('top'),
      width:  element.getStyle('width'),
      height: element.getStyle('height')
    });

    element.setStyle({
      position: 'absolute',
      top:    offset.top + 'px',
      left:   offset.left + 'px',
      width:  layout.get('width') + 'px',
      height: layout.get('height') + 'px'
    });

    return element;
  }
  
  function absolutizeTransform(element) {
    element = $(element);
    
    var offsetParent = getOffsetParent(element);
    var eOffset = element.viewportOffset(),
     pOffset = offsetParent.viewportOffset();

    var offset = eOffset.relativeTo(pOffset);
    var layout = element.getLayout();

    element.store('prototype_absolutize_original_styles', {
      left:   element.getStyle('left'),
      top:    element.getStyle('top')
    });

    element.setStyle({
      position: 'absolute',
      top:    '0px',
      left:   '0px',
      webkitTransform:  'translate3d(' + offset.left + 'px, ' + offset.top + 'px, 0)'
    });

    return element;
  }

  function relativize(element) {
    element = $(element);
    if (Element.getStyle(element, 'position') === 'relative') {
      return element;
    }

    var originalStyles =
     element.retrieve('prototype_absolutize_original_styles');

    if (originalStyles) element.setStyle(originalStyles);
    return element;
  }

  if (Prototype.Browser.IE) {
    getOffsetParent = getOffsetParent.wrap(
      function(proceed, element) {
        element = $(element);

        if (isDocument(element) || isDetached(element) || isBody(element) || isHtml(element))
          return $(document.body);

        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);

        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );

    positionedOffset = positionedOffset.wrap(function(proceed, element) {
      element = $(element);
      if (!element.parentNode) return new Element.Offset(0, 0);
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);

      var offsetParent = element.getOffsetParent();
      if (offsetParent && offsetParent.getStyle('position') === 'fixed')
        hasLayout(offsetParent);

      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    });
  } else if (Prototype.Browser.Webkit) {
    cumulativeOffset = function(element) {
      element = $(element);
      var valueT = 0, valueL = 0;
      do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        if (element.offsetParent == document.body)
          if (Element.getStyle(element, 'position') == 'absolute') break;

        element = element.offsetParent;
      } while (element);

      return new Element.Offset(valueL, valueT);
    };
  }


  Element.addMethods({
    getLayout:              getLayout,
    measure:                measure,
    getDimensions:          getDimensions,
    getOffsetParent:        getOffsetParent,
    cumulativeOffset:       cumulativeOffset,
    positionedOffset:       positionedOffset,
    cumulativeScrollOffset: cumulativeScrollOffset,
    viewportOffset:         viewportOffset,
    absolutize:             absolutize,
	absolutizeTransform:    absolutizeTransform,
    relativize:             relativize
  });

  function isBody(element) {
    return element.nodeName.toUpperCase() === 'BODY';
  }

  function isHtml(element) {
    return element.nodeName.toUpperCase() === 'HTML';
  }

  function isDocument(element) {
    return element.nodeType === Node.DOCUMENT_NODE;
  }

  function isDetached(element) {
    return element !== document.body &&
     !Element.descendantOf(element, document.body);
  }

  if ('getBoundingClientRect' in document.documentElement) {
    Element.addMethods({
      viewportOffset: function(element) {
        element = $(element);
        if (isDetached(element)) return new Element.Offset(0, 0);

        var rect = element.getBoundingClientRect(),
         docEl = document.documentElement;
        return new Element.Offset(rect.left - docEl.clientLeft,
         rect.top - docEl.clientTop);
      }
    });
  }
})();
window.$$ = function() {
  var expression = $A(arguments).join(', ');
  return Prototype.Selector.select(expression, document);
};

Prototype.Selector = (function() {

  function select() {
    throw new Error('Method "Prototype.Selector.select" must be defined.');
  }

  function match() {
    throw new Error('Method "Prototype.Selector.match" must be defined.');
  }

  function find(elements, expression, index) {
    index = index || 0;
    var match = Prototype.Selector.match, length = elements.length, matchIndex = 0, i;

    for (i = 0; i < length; i++) {
      if (match(elements[i], expression) && index == matchIndex++) {
        return Element.extend(elements[i]);
      }
    }
  }

  function extendElements(elements) {
    for (var i = 0, length = elements.length; i < length; i++) {
      Element.extend(elements[i]);
    }
    return elements;
  }


  var K = Prototype.K;

  return {
    select: select,
    match: match,
    find: find,
    extendElements: (Element.extend === K) ? K : extendElements,
    extendElement: Element.extend
  };
})();
/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	var origContext = context = context || document;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, check, mode, extra, prune = true, contextXML = isXML(context),
		soFar = selector;

	while ( (chunker.exec(""), m = chunker.exec(soFar)) !== null ) {
		soFar = m[3];

		parts.push( m[1] );

		if ( m[2] ) {
			extra = m[3];
			break;
		}
	}

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] )
					selector += parts.shift();

				set = posProcess( selector, set );
			}
		}
	} else {
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			var ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			var ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				var cur = parts.pop(), pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		throw "Syntax error, unrecognized expression: " + (cur || selector);
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set, match;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;

		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.match[ type ].exec( expr )) != null ) {
				var filter = Expr.filter[ type ], found, item;
				anyFound = false;

				if ( curLoop == result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		if ( expr == old ) {
			if ( anyFound == null ) {
				throw "Syntax error, unrecognized expression: " + expr;
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag && !isXML ) {
				part = part.toUpperCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string";

			if ( isPartStr && !/\W/.test(part) ) {
				part = isXML ? part : part.toUpperCase();

				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName === part ? parent : false;
					}
				}
			} else {
				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( !/\W/.test(part) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context, isXML){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").indexOf(match) >= 0) ) {
						if ( !inplace )
							result.push( elem );
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			for ( var i = 0; curLoop[i] === false; i++ ){}
			return curLoop[i] && isXML(curLoop[i]) ? match[1] : match[1].toUpperCase();
		},
		CHILD: function(match){
			if ( match[1] == "nth" ) {
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] == "even" && "2n" || match[2] == "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");

			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}

			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return /h\d/i.test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toUpperCase() === "BUTTON";
		},
		input: function(elem){
			return /input|select|textarea|button/i.test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 == i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 == i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var i = 0, l = not.length; i < l; i++ ) {
					if ( not[i] === elem ) {
						return false;
					}
				}

				return true;
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )  {
						if ( node.nodeType === 1 ) return false;
					}
					if ( type == 'first') return true;
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )  {
						if ( node.nodeType === 1 ) return false;
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first == 1 && last == 0 ) {
						return true;
					}

					var doneName = match[0],
						parent = elem.parentNode;

					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						}
						parent.sizcache = doneName;
					}

					var diff = elem.nodeIndex - last;
					if ( first == 0 ) {
						return diff == 0;
					} else {
						return ( diff % first == 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value != check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS;

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}

	return array;
};

try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 );

} catch(e){
	makeArray = function(array, results) {
		var ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var i = 0, l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( var i = 0; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		if ( !a.sourceIndex || !b.sourceIndex ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		if ( !a.ownerDocument || !b.ownerDocument ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

(function(){
	var form = document.createElement("div"),
		id = "script" + (new Date).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	if ( !!document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){

	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) (function(){
	var oldSizzle = Sizzle, div = document.createElement("div");
	div.innerHTML = "<p class='TEST'></p>";

	if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
		return;
	}

	Sizzle = function(query, context, extra, seed){
		context = context || document;

		if ( !seed && context.nodeType === 9 && !isXML(context) ) {
			try {
				return makeArray( context.querySelectorAll(query), extra );
			} catch(e){}
		}

		return oldSizzle(query, context, extra, seed);
	};

	for ( var prop in oldSizzle ) {
		Sizzle[ prop ] = oldSizzle[ prop ];
	}

	div = null; // release memory in IE
})();

if ( document.getElementsByClassName && document.documentElement.getElementsByClassName ) (function(){
	var div = document.createElement("div");
	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	if ( div.getElementsByClassName("e").length === 0 )
		return;

	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 )
		return;

	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ){
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ) {
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var contains = document.compareDocumentPosition ?  function(a, b){
	return a.compareDocumentPosition(b) & 16;
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

var isXML = function(elem){
	return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
		!!elem.ownerDocument && elem.ownerDocument.documentElement.nodeName !== "HTML";
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};


window.Sizzle = Sizzle;

})();

Prototype._original_property = window.Sizzle;

;(function(engine) {
  var extendElements = Prototype.Selector.extendElements;

  function select(selector, scope) {
    return extendElements(engine(selector, scope || document));
  }

  function match(element, selector) {
    return engine.matches(selector, [element]).length == 1;
  }

  Prototype.Selector.engine = engine;
  Prototype.Selector.select = select;
  Prototype.Selector.match = match;
})(Sizzle);

window.Sizzle = Prototype._original_property;
delete Prototype._original_property;

var Form = {
  reset: function(form) {
    form = $(form);
    form.reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit, accumulator, initial;

    if (options.hash) {
      initial = {};
      accumulator = function(result, key, value) {
        if (key in result) {
          if (!Object.isArray(result[key])) result[key] = [result[key]];
          result[key].push(value);
        } else result[key] = value;
        return result;
      };
    } else {
      initial = '';
      accumulator = function(result, key, value) {
        return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + encodeURIComponent(value);
      }
    }

    return elements.inject(initial, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          result = accumulator(result, key, value);
        }
      }
      return result;
    });
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    var elements = $(form).getElementsByTagName('*'),
        element,
        arr = [ ],
        serializers = Form.Element.Serializers;
    for (var i = 0; element = elements[i]; i++) {
      arr.push(element);
    }
    return arr.inject([], function(elements, child) {
      if (serializers[child.tagName.toLowerCase()])
        elements.push(Element.extend(child));
      return elements;
    })
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return /^(?:input|select|textarea)$/i.test(element.tagName);
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    var element = form.findFirstElement();
    if (element) element.activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/


Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {

  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !(/^(?:button|reset|submit)$/i.test(element.type))))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;

var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = (function() {
  function input(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return inputSelector(element, value);
      default:
        return valueSelector(element, value);
    }
  }

  function inputSelector(element, value) {
    if (Object.isUndefined(value))
      return element.checked ? element.value : null;
    else element.checked = !!value;
  }

  function valueSelector(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  }

  function select(element, value) {
    if (Object.isUndefined(value))
      return (element.type === 'select-one' ? selectOne : selectMany)(element);

    var opt, currentValue, single = !Object.isArray(value);
    for (var i = 0, length = element.length; i < length; i++) {
      opt = element.options[i];
      currentValue = this.optionValue(opt);
      if (single) {
        if (currentValue == value) {
          opt.selected = true;
          return;
        }
      }
      else opt.selected = value.include(currentValue);
    }
  }

  function selectOne(element) {
    var index = element.selectedIndex;
    return index >= 0 ? optionValue(element.options[index]) : null;
  }

  function selectMany(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(optionValue(opt));
    }
    return values;
  }

  function optionValue(opt) {
    return Element.hasAttribute(opt, 'value') ? opt.value : opt.text;
  }

  return {
    input:         input,
    inputSelector: inputSelector,
    textarea:      valueSelector,
    select:        select,
    selectOne:     selectOne,
    selectMany:    selectMany,
    optionValue:   optionValue,
    button:        valueSelector
  };
})();

/*--------------------------------------------------------------------------*/


Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
(function() {

  var Event = {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT:   45,

    cache: {}
  };

  var docEl = document.documentElement;
  var MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED = 'onmouseenter' in docEl
    && 'onmouseleave' in docEl;



  var isIELegacyEvent = function(event) { return false; };

  if (window.attachEvent) {
    if (window.addEventListener) {
      isIELegacyEvent = function(event) {
        return !(event instanceof window.Event);
      };
    } else {
      isIELegacyEvent = function(event) { return true; };
    }
  }

  var _isButton;

  function _isButtonForDOMEvents(event, code) {
    return event.which ? (event.which === code + 1) : (event.button === code);
  }

  var legacyButtonMap = { 0: 1, 1: 4, 2: 2 };
  function _isButtonForLegacyEvents(event, code) {
    return event.button === legacyButtonMap[code];
  }

  function _isButtonForWebKit(event, code) {
    switch (code) {
      case 0: return event.which == 1 && !event.metaKey;
      case 1: return event.which == 2 || (event.which == 1 && event.metaKey);
      case 2: return event.which == 3;
      default: return false;
    }
  }

  if (window.attachEvent) {
    if (!window.addEventListener) {
      _isButton = _isButtonForLegacyEvents;
    } else {
      _isButton = function(event, code) {
        return isIELegacyEvent(event) ? _isButtonForLegacyEvents(event, code) :
         _isButtonForDOMEvents(event, code);
      }
    }
  } else if (Prototype.Browser.WebKit) {
    _isButton = _isButtonForWebKit;
  } else {
    _isButton = _isButtonForDOMEvents;
  }

  function isLeftClick(event)   { return _isButton(event, 0) }

  function isMiddleClick(event) { return _isButton(event, 1) }

  function isRightClick(event)  { return _isButton(event, 2) }

  function element(event) {
    event = Event.extend(event);

    var node = event.target, type = event.type,
     currentTarget = event.currentTarget;

    if (currentTarget && currentTarget.tagName) {
      if (type === 'load' || type === 'error' ||
        (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
          && currentTarget.type === 'radio'))
            node = currentTarget;
    }

    if (node.nodeType == Node.TEXT_NODE)
      node = node.parentNode;

    return Element.extend(node);
  }

  function findElement(event, expression) {
    var element = Event.element(event);

    if (!expression) return element;
    while (element) {
      if (Object.isElement(element) && Prototype.Selector.match(element, expression)) {
        return Element.extend(element);
      }
      element = element.parentNode;
    }
  }

  function pointer(event) {
    return { x: pointerX(event), y: pointerY(event) };
  }

  function pointerX(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollLeft: 0 };

    return event.pageX || (event.clientX +
      (docElement.scrollLeft || body.scrollLeft) -
      (docElement.clientLeft || 0));
  }

  function pointerY(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollTop: 0 };

    return  event.pageY || (event.clientY +
       (docElement.scrollTop || body.scrollTop) -
       (docElement.clientTop || 0));
  }


  function stop(event) {
    Event.extend(event);
    event.preventDefault();
    event.stopPropagation();

    event.stopped = true;
  }


  Event.Methods = {
    isLeftClick:   isLeftClick,
    isMiddleClick: isMiddleClick,
    isRightClick:  isRightClick,

    element:     element,
    findElement: findElement,

    pointer:  pointer,
    pointerX: pointerX,
    pointerY: pointerY,

    stop: stop
  };

  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (window.attachEvent) {
    function _relatedTarget(event) {
      var element;
      switch (event.type) {
        case 'mouseover':
        case 'mouseenter':
          element = event.fromElement;
          break;
        case 'mouseout':
        case 'mouseleave':
          element = event.toElement;
          break;
        default:
          return null;
      }
      return Element.extend(element);
    }

    var additionalMethods = {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return '[object Event]' }
    };

    Event.extend = function(event, element) {
      if (!event) return false;

      if (!isIELegacyEvent(event)) return event;

      if (event._extendedByPrototype) return event;
      event._extendedByPrototype = Prototype.emptyFunction;

      var pointer = Event.pointer(event);

      Object.extend(event, {
        target: event.srcElement || element,
        relatedTarget: _relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });

      Object.extend(event, methods);
      Object.extend(event, additionalMethods);

      return event;
    };
  } else {
    Event.extend = Prototype.K;
  }

  if (window.addEventListener) {
    Event.prototype = window.Event.prototype || document.createEvent('HTMLEvents').__proto__;
    Object.extend(Event.prototype, methods);
  }

  function _createResponder(element, eventName, handler) {
    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) {
      CACHE.push(element);
      registry = Element.retrieve(element, 'prototype_event_registry', $H());
    }

    var respondersForEvent = registry.get(eventName);
    if (Object.isUndefined(respondersForEvent)) {
      respondersForEvent = [];
      registry.set(eventName, respondersForEvent);
    }

    if (respondersForEvent.pluck('handler').include(handler)) return false;

    var responder;
    if (eventName.include(":")) {
      responder = function(event) {
        if (Object.isUndefined(event.eventName))
          return false;

        if (event.eventName !== eventName)
          return false;

        Event.extend(event, element);
        handler.call(element, event);
      };
    } else {
      if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED &&
       (eventName === "mouseenter" || eventName === "mouseleave")) {
        if (eventName === "mouseenter" || eventName === "mouseleave") {
          responder = function(event) {
            Event.extend(event, element);

            var parent = event.relatedTarget;
            while (parent && parent !== element) {
              try { parent = parent.parentNode; }
              catch(e) { parent = element; }
            }

            if (parent === element) return;

            handler.call(element, event);
          };
        }
      } else {
        responder = function(event) {
          Event.extend(event, element);
          handler.call(element, event);
        };
      }
    }

    responder.handler = handler;
    respondersForEvent.push(responder);
    return responder;
  }

  function _destroyCache() {
    for (var i = 0, length = CACHE.length; i < length; i++) {
      Event.stopObserving(CACHE[i]);
      CACHE[i] = null;
    }
  }

  var CACHE = [];

  if (Prototype.Browser.IE)
    window.attachEvent('onunload', _destroyCache);

  if (Prototype.Browser.WebKit)
    window.addEventListener('unload', Prototype.emptyFunction, false);


  var _getDOMEventName = Prototype.K,
      translations = { mouseenter: "mouseover", mouseleave: "mouseout" };

  if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED) {
    _getDOMEventName = function(eventName) {
      return (translations[eventName] || eventName);
    };
  }

  function observe(element, eventName, handler) {
    element = $(element);

    var responder = _createResponder(element, eventName, handler);

    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.addEventListener)
        element.addEventListener("dataavailable", responder, false);
      else {
        element.attachEvent("ondataavailable", responder);
        element.attachEvent("onlosecapture", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);

      if (element.addEventListener)
        element.addEventListener(actualEventName, responder, false);
      else
        element.attachEvent("on" + actualEventName, responder);
    }

    return element;
  }

  function stopObserving(element, eventName, handler) {
    element = $(element);

    var registry = Element.retrieve(element, 'prototype_event_registry');
    if (!registry) return element;

    if (!eventName) {
      registry.each( function(pair) {
        var eventName = pair.key;
        stopObserving(element, eventName);
      });
      return element;
    }

    var responders = registry.get(eventName);
    if (!responders) return element;

    if (!handler) {
      responders.each(function(r) {
        stopObserving(element, eventName, r.handler);
      });
      return element;
    }

    var i = responders.length, responder;
    while (i--) {
      if (responders[i].handler === handler) {
        responder = responders[i];
        break;
      }
    }
    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.removeEventListener)
        element.removeEventListener("dataavailable", responder, false);
      else {
        element.detachEvent("ondataavailable", responder);
        element.detachEvent("onlosecapture", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);
      if (element.removeEventListener)
        element.removeEventListener(actualEventName, responder, false);
      else
        element.detachEvent('on' + actualEventName, responder);
    }

    registry.set(eventName, responders.without(responder));

    return element;
  }

  function fire(element, eventName, memo, bubble) {
    element = $(element);

    if (Object.isUndefined(bubble))
      bubble = true;

    if (element == document && document.createEvent && !element.dispatchEvent)
      element = document.documentElement;

    var event;
    if (document.createEvent) {
      event = document.createEvent('HTMLEvents');
      event.initEvent('dataavailable', bubble, true);
    } else {
      event = document.createEventObject();
      event.eventType = bubble ? 'ondataavailable' : 'onlosecapture';
    }

    event.eventName = eventName;
    event.memo = memo || { };

    if (document.createEvent)
      element.dispatchEvent(event);
    else
      element.fireEvent(event.eventType, event);

    return Event.extend(event);
  }

  Event.Handler = Class.create({
    initialize: function(element, eventName, selector, callback) {
      this.element   = $(element);
      this.eventName = eventName;
      this.selector  = selector;
      this.callback  = callback;
      this.handler   = this.handleEvent.bind(this);
    },

    start: function() {
      Event.observe(this.element, this.eventName, this.handler);
      return this;
    },

    stop: function() {
      Event.stopObserving(this.element, this.eventName, this.handler);
      return this;
    },

    handleEvent: function(event) {
      var element = Event.findElement(event, this.selector);
      if (element) this.callback.call(this.element, event, element);
    }
  });

  function on(element, eventName, selector, callback) {
    element = $(element);
    if (Object.isFunction(selector) && Object.isUndefined(callback)) {
      callback = selector, selector = null;
    }

    return new Event.Handler(element, eventName, selector, callback).start();
  }

  Object.extend(Event, Event.Methods);

  Object.extend(Event, {
    fire:          fire,
    observe:       observe,
    stopObserving: stopObserving,
    on:            on
  });

  Element.addMethods({
    fire:          fire,

    observe:       observe,

    stopObserving: stopObserving,

    on:            on
  });

  Object.extend(document, {
    fire:          fire.methodize(),

    observe:       observe.methodize(),

    stopObserving: stopObserving.methodize(),

    on:            on.methodize(),

    loaded:        false
  });

  if (window.Event) Object.extend(window.Event, Event);
  else window.Event = Event;
})();

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards, John Resig, and Diego Perini. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearTimeout(timer);
    document.loaded = true;
    document.fire('dom:loaded');
  }

  function checkReadyState() {
    if (document.readyState === 'complete') {
      document.stopObserving('readystatechange', checkReadyState);
      fireContentLoadedEvent();
    }
  }

  function pollDoScroll() {
    try { document.documentElement.doScroll('left'); }
    catch(e) {
      timer = pollDoScroll.defer();
      return;
    }
    fireContentLoadedEvent();
  }

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
  } else {
    document.observe('readystatechange', checkReadyState);
    if (window == top)
      timer = pollDoScroll.defer();
  }

  Event.observe(window, 'load', fireContentLoadedEvent);
})();


Element.addMethods();
/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

var Position = {
  includeScrollOffsets: false,

  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },


  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },
  
  absolutizeTransform: function(element) {
      Position.prepare();
      return Element.absolutizeTransform(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

(function() {
  window.Selector = Class.create({
    initialize: function(expression) {
      this.expression = expression.strip();
    },

    findElements: function(rootElement) {
      return Prototype.Selector.select(this.expression, rootElement);
    },

    match: function(element) {
      return Prototype.Selector.match(element, this.expression);
    },

    toString: function() {
      return this.expression;
    },

    inspect: function() {
      return "#<Selector: " + this.expression + ">";
    }
  });

  Object.extend(Selector, {
    matchElements: function(elements, expression) {
      var match = Prototype.Selector.match,
          results = [];

      for (var i = 0, length = elements.length; i < length; i++) {
        var element = elements[i];
        if (match(element, expression)) {
          results.push(Element.extend(element));
        }
      }
      return results;
    },

    findElement: function(elements, expression, index) {
      index = index || 0;
      var matchIndex = 0, element;
      for (var i = 0, length = elements.length; i < length; i++) {
        element = elements[i];
        if (Prototype.Selector.match(element, expression) && index === matchIndex++) {
          return Element.extend(element);
        }
      }
    },

    findChildElements: function(element, expressions) {
      var selector = expressions.toArray().join(', ');
      return Prototype.Selector.select(selector, element || document);
    }
  });
})();
// script.aculo.us builder.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

var Builder = {
  NODEMAP: {
    AREA: 'map',
    CAPTION: 'table',
    COL: 'table',
    COLGROUP: 'table',
    LEGEND: 'fieldset',
    OPTGROUP: 'select',
    OPTION: 'select',
    PARAM: 'object',
    TBODY: 'table',
    TD: 'table',
    TFOOT: 'table',
    TH: 'table',
    THEAD: 'table',
    TR: 'table'
  },
  // note: For Firefox < 1.5, OPTION and OPTGROUP tags are currently broken,
  //       due to a Firefox bug
  node: function(elementName) {
    elementName = elementName.toUpperCase();

    // try innerHTML approach
    var parentTag = this.NODEMAP[elementName] || 'div';
    var parentElement = document.createElement(parentTag);
    try { // prevent IE "feature": http://dev.rubyonrails.org/ticket/2707
      parentElement.innerHTML = "<" + elementName + "></" + elementName + ">";
    } catch(e) {}
    var element = parentElement.firstChild || null;

    // see if browser added wrapping tags
    if(element && (element.tagName.toUpperCase() != elementName))
      element = element.getElementsByTagName(elementName)[0];

    // fallback to createElement approach
    if(!element) element = document.createElement(elementName);

    // abort if nothing could be created
    if(!element) return;

    // attributes (or text)
    if(arguments[1])
      if(this._isStringOrNumber(arguments[1]) ||
        (arguments[1] instanceof Array) ||
        arguments[1].tagName) {
          this._children(element, arguments[1]);
        } else {
          var attrs = this._attributes(arguments[1]);
          if(attrs.length) {
            try { // prevent IE "feature": http://dev.rubyonrails.org/ticket/2707
              parentElement.innerHTML = "<" +elementName + " " +
                attrs + "></" + elementName + ">";
            } catch(e) {}
            element = parentElement.firstChild || null;
            // workaround firefox 1.0.X bug
            if(!element) {
              element = document.createElement(elementName);
              for(attr in arguments[1])
                element[attr == 'class' ? 'className' : attr] = arguments[1][attr];
            }
            if(element.tagName.toUpperCase() != elementName)
              element = parentElement.getElementsByTagName(elementName)[0];
          }
        }

    // text, or array of children
    if(arguments[2])
      this._children(element, arguments[2]);

     return $(element);
  },
  _text: function(text) {
     return document.createTextNode(text);
  },

  ATTR_MAP: {
    'className': 'class',
    'htmlFor': 'for'
  },

  _attributes: function(attributes) {
    var attrs = [];
    for(attribute in attributes)
      attrs.push((attribute in this.ATTR_MAP ? this.ATTR_MAP[attribute] : attribute) +
          '="' + attributes[attribute].toString().escapeHTML().gsub(/"/,'&quot;') + '"');
    return attrs.join(" ");
  },
  _children: function(element, children) {
    if(children.tagName) {
      element.appendChild(children);
      return;
    }
    if(typeof children=='object') { // array can hold nodes and text
      children.flatten().each( function(e) {
        if(typeof e=='object')
          element.appendChild(e);
        else
          if(Builder._isStringOrNumber(e))
            element.appendChild(Builder._text(e));
      });
    } else
      if(Builder._isStringOrNumber(children))
        element.appendChild(Builder._text(children));
  },
  _isStringOrNumber: function(param) {
    return(typeof param=='string' || typeof param=='number');
  },
  build: function(html) {
    var element = this.node('div');
    $(element).update(html.strip());
    return element.down();
  },
  dump: function(scope) {
    if(typeof scope != 'object' && typeof scope != 'function') scope = window; //global scope

    var tags = ("A ABBR ACRONYM ADDRESS APPLET AREA B BASE BASEFONT BDO BIG BLOCKQUOTE BODY " +
      "BR BUTTON CAPTION CENTER CITE CODE COL COLGROUP DD DEL DFN DIR DIV DL DT EM FIELDSET " +
      "FONT FORM FRAME FRAMESET H1 H2 H3 H4 H5 H6 HEAD HR HTML I IFRAME IMG INPUT INS ISINDEX "+
      "KBD LABEL LEGEND LI LINK MAP MENU META NOFRAMES NOSCRIPT OBJECT OL OPTGROUP OPTION P "+
      "PARAM PRE Q S SAMP SCRIPT SELECT SMALL SPAN STRIKE STRONG STYLE SUB SUP TABLE TBODY TD "+
      "TEXTAREA TFOOT TH THEAD TITLE TR TT U UL VAR").split(/\s+/);

    tags.each( function(tag){
      scope[tag] = function() {
        return Builder.node.apply(Builder, [tag].concat($A(arguments)));
      };
    });
  }
};
/**
 * Copyright (c) 2010-2013, Apple Inc. All rights reserved. 
 * 
 * IMPORTANT NOTE: This file is licensed only for use on Apple-branded
 * computers and is subject to the terms and conditions of the Apple Software
 * License Agreement accompanying the package this file is a part of.
 * You may not port this file to another platform without Apple's written consent.
 * 
 * IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
 * of the Apple Software and is subject to the terms and conditions of the Apple
 * Software License Agreement accompanying the package this file is part of.
 **/


function _ucs4Ordinal(ch) {
	var ucs4Ordinal = "";
	ucs4Ordinal += String.fromCharCode(240 | (ch >> 18));
	ucs4Ordinal += String.fromCharCode(127 | ((ch >> 12) & 63));
	ucs4Ordinal += String.fromCharCode(127 | ((ch >> 6) & 63));
	ucs4Ordinal += String.fromCharCode(127 | (ch & 63));
	return ucs4Ordinal;
}

/*
 * Based on PyUnicode_EncodeUTF8
 */

function utf8Encode (string) {
	var utf8Text = "";

	for (var i = 0; i < string.length; i++) {
		var ch = string.charCodeAt(i);

		if (ch < 128) {
			// Characters less than 128 are ASCII
			utf8Text += String.fromCharCode(ch);
		}
		else if((ch > 127) && (ch < 2048)) {
			// Characters between 127 and 2048 are Latin-1
			utf8Text += String.fromCharCode(192 | (ch >> 6));
			utf8Text += String.fromCharCode(128 | (ch & 63));
		}
		else {
			// All other characters are UCS2 or UCS4 unicode ordinals
			if (ch < 65536) {
				// Special case check for high surrogates
				if ((55296 <= ch) && (ch <= 57343) && i != string.length) {
					var ch2 = string.charCodeAt(i + 1);
					// Check for low surrogate and combine for a UCS4 value
					if ((56320 <= ch2) && (ch2 < 57343)) {
						ch = ((ch - 55296) << 10 | (ch2 - 56320)) + 65536;
						i++;
						utf8Text += _ucs4Ordinal(ch);
					}
					// Fall through and handle isolated high surrogates
				}
				utf8Text += String.fromCharCode(224 | (ch >> 12));
				utf8Text += String.fromCharCode(128 | ((ch >> 6) & 63));
				utf8Text += String.fromCharCode(128 | (ch & 63));
				continue;
			}
			utf8Text += _ucs4Ordinal(ch);
		}

	}

	return utf8Text;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
function binl2binstr(binarray)
{
  var str = "";
  for (var i = 0; i < binarray.length; i++)
  {
	for (var j = 0; j < 4; j++)
	{
		str += String.fromCharCode(((binarray[i] >> (j*8)) & 0xFF));
	}
  }
  return str;
}

/*
 * Convert a string to an array of little-endian words
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 */
function str2binl2(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
  return bin;
}

function digestResponse(username, password, challengeString) {
	var challenge = challengeToObject(challengeString);
	// for now lets just handle the realm and nonce
	var nonce = challenge['Digest nonce'];
	if (!nonce) {
	    nonce = challenge.nonce;
	}
	var realm = challenge.realm;
	//var method = challenge['method'];
	//if (!method) {
	//	method = 'GET';
	//}
	var method = 'AUTHENTICATE';
	var path = challenge.path;
	if (!path || path == undefined) {
		path = '/';
	}
	
	// handle qop
	var qop = challenge.qop;
	var doQOPAuth = false;
	var extras = "" // for any of the extra fields we need
	if (qop) {
		var opaque = challenge.opaque;
		var qops = qop.split(",");
		qops.each(function(aQop) {
			if (aQop.indexOf("auth") != -1) {
				doQOPAuth = true;
			}
		});
	}
	
	if (doQOPAuth) {
		// generate a 2617 response
		var cnonce = randomString(36);
	}
	
	var HA1 = new Array(username, realm, password)
	HA1 = utf8Encode(HA1.join(':'));
	
	if (doQOPAuth) {
		HA1 = core_md5(str2binl2(HA1), HA1.length * chrsz);
		HA1 = binl2binstr(HA1) + ":" + nonce + ":" + cnonce;
	}

	HA1 = hex_md5(HA1, HA1.length + chrsz);

	var HA2 = new Array(method, path);
	HA2 = utf8Encode(HA2.join(':'));
	HA2 = hex_md5(HA2, HA2.length + chrsz);
	
	// first, generate a legacy response which will be used in most cases
	var response = new Array(HA1, nonce, HA2);
	
	// now deal with more sophisticated challenges
	if (doQOPAuth) {
		response = new Array(HA1, nonce, "00000001", cnonce, "auth", HA2);
		extras = "qop=\"auth\",nc=\"00000001\",cnonce=\""+cnonce+"\",algorithm=md5-sess,";
	}
	
	response = utf8Encode(response.join(':'));
	response = hex_md5(response, response.length + chrsz);
	var digest = "Digest username=\""+username+"\",realm=\""+realm+"\",nonce=\""+nonce+"\",uri=\""+path+"\","+extras+"response=\""+response +"\"";
	if (opaque != undefined) {
		digest += ",opaque=\""+opaque+"\""
	}
	return digest;
}

function challengeToObject(challengeString) {
	var anObj = {};
	var pairs = challengeString.split(",");
	pairs.each(function(aPair) {
		var kv = aPair.split("=");
		var key = kv[0];
		var value = stripIt(kv.slice(1).join("="));
		anObj[key] = value;
	});
	return anObj;
}

function stripIt(x){
	x = x.replace(/['"]/g,'');
	return x;
}

function randomString(strLength, charSet) {
	if (charSet == undefined) {
		// not great, but good enough to plow the field
		charSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	}
	var randomString = "";
	for (var i = 0; i < strLength; i++) {
		var whichChar = Math.floor(Math.random()*charSet.length);
		randomString += charSet[whichChar];
	}
	return randomString;
}

;
// script.aculo.us effects.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
// Contributors:
//  Justin Palmer (http://encytemedia.com/)
//  Mark Pilgrim (http://diveintomark.org/)
//  Martin Bialasinki
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// converts rgb() and #xxx to #xxxxxx format,
// returns self (or first argument) if not convertable
String.prototype.parseColor = function() {
  var color = '#';
  if (this.slice(0,4) == 'rgb(') {
    var cols = this.slice(4,this.length-1).split(',');
    var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);
  } else {
    if (this.slice(0,1) == '#') {
      if (this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();
      if (this.length==7) color = this.toLowerCase();
    }
  }
  return (color.length==7 ? color : (arguments[0] || this));
};

/*--------------------------------------------------------------------------*/

Element.collectTextNodes = function(element) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
  }).flatten().join('');
};

Element.collectTextNodesIgnoreClass = function(element, className) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      ((node.hasChildNodes() && !Element.hasClassName(node,className)) ?
        Element.collectTextNodesIgnoreClass(node, className) : ''));
  }).flatten().join('');
};

Element.setContentZoom = function(element, percent) {
  element = $(element);
  element.setStyle({fontSize: (percent/100) + 'em'});
  if (Prototype.Browser.WebKit) window.scrollBy(0,0);
  return element;
};

Element.getInlineOpacity = function(element){
  return $(element).style.opacity || '';
};

Element.forceRerendering = function(element) {
  try {
    element = $(element);
    var n = document.createTextNode(' ');
    element.appendChild(n);
    element.removeChild(n);
  } catch(e) { }
};

/*--------------------------------------------------------------------------*/

var Effect = {
  _elementDoesNotExistError: {
    name: 'ElementDoesNotExistError',
    message: 'The specified DOM element does not exist, but is required for this effect to operate'
  },
  Transitions: {
    linear: Prototype.K,
    sinoidal: function(pos) {
      return (-Math.cos(pos*Math.PI)/2) + .5;
    },
    reverse: function(pos) {
      return 1-pos;
    },
    flicker: function(pos) {
      var pos = ((-Math.cos(pos*Math.PI)/4) + .75) + Math.random()/4;
      return pos > 1 ? 1 : pos;
    },
    wobble: function(pos) {
      return (-Math.cos(pos*Math.PI*(9*pos))/2) + .5;
    },
    pulse: function(pos, pulses) {
      return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
    },
    spring: function(pos) {
      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
    },
    none: function(pos) {
      return 0;
    },
    full: function(pos) {
      return 1;
    }
  },
  DefaultOptions: {
    duration:   1.0,   // seconds
    fps:        100,   // 100= assume 66fps max.
    sync:       false, // true for combining
    from:       0.0,
    to:         1.0,
    delay:      0.0,
    queue:      'parallel'
  },
  tagifyText: function(element) {
    var tagifyStyle = 'position:relative';
    if (Prototype.Browser.IE) tagifyStyle += ';zoom:1';

    element = $(element);
    $A(element.childNodes).each( function(child) {
      if (child.nodeType==3) {
        child.nodeValue.toArray().each( function(character) {
          element.insertBefore(
            new Element('span', {style: tagifyStyle}).update(
              character == ' ' ? String.fromCharCode(160) : character),
              child);
        });
        Element.remove(child);
      }
    });
  },
  multiple: function(element, effect) {
    var elements;
    if (((typeof element == 'object') ||
        Object.isFunction(element)) &&
       (element.length))
      elements = element;
    else
      elements = $(element).childNodes;

    var options = Object.extend({
      speed: 0.1,
      delay: 0.0
    }, arguments[2] || { });
    var masterDelay = options.delay;

    $A(elements).each( function(element, index) {
      new effect(element, Object.extend(options, { delay: index * options.speed + masterDelay }));
    });
  },
  PAIRS: {
    'slide':  ['SlideDown','SlideUp'],
    'blind':  ['BlindDown','BlindUp'],
    'appear': ['Appear','Fade']
  },
  toggle: function(element, effect, options) {
    element = $(element);
    effect  = (effect || 'appear').toLowerCase();
    
    return Effect[ Effect.PAIRS[ effect ][ element.visible() ? 1 : 0 ] ](element, Object.extend({
      queue: { position:'end', scope:(element.id || 'global'), limit: 1 }
    }, options || {}));
  }
};

Effect.DefaultOptions.transition = Effect.Transitions.sinoidal;

/* ------------- core effects ------------- */

Effect.ScopedQueue = Class.create(Enumerable, {
  initialize: function() {
    this.effects  = [];
    this.interval = null;
  },
  _each: function(iterator) {
    this.effects._each(iterator);
  },
  add: function(effect) {
    var timestamp = new Date().getTime();

    var position = Object.isString(effect.options.queue) ?
      effect.options.queue : effect.options.queue.position;

    switch(position) {
      case 'front':
        // move unstarted effects after this effect
        this.effects.findAll(function(e){ return e.state=='idle' }).each( function(e) {
            e.startOn  += effect.finishOn;
            e.finishOn += effect.finishOn;
          });
        break;
      case 'with-last':
        timestamp = this.effects.pluck('startOn').max() || timestamp;
        break;
      case 'end':
        // start effect after last queued effect has finished
        timestamp = this.effects.pluck('finishOn').max() || timestamp;
        break;
    }

    effect.startOn  += timestamp;
    effect.finishOn += timestamp;

    if (!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit))
      this.effects.push(effect);

    if (!this.interval)
      this.interval = setInterval(this.loop.bind(this), 15);
  },
  remove: function(effect) {
    this.effects = this.effects.reject(function(e) { return e==effect });
    if (this.effects.length == 0) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  loop: function() {
    var timePos = new Date().getTime();
    for(var i=0, len=this.effects.length;i<len;i++)
      this.effects[i] && this.effects[i].loop(timePos);
  }
});

Effect.Queues = {
  instances: $H(),
  get: function(queueName) {
    if (!Object.isString(queueName)) return queueName;

    return this.instances.get(queueName) ||
      this.instances.set(queueName, new Effect.ScopedQueue());
  }
};
Effect.Queue = Effect.Queues.get('global');

Effect.Base = Class.create({
  position: null,
  start: function(options) {
    if (options && options.transition === false) options.transition = Effect.Transitions.linear;
    this.options      = Object.extend(Object.extend({ },Effect.DefaultOptions), options || { });
    this.currentFrame = 0;
    this.state        = 'idle';
    this.startOn      = this.options.delay*1000;
    this.finishOn     = this.startOn+(this.options.duration*1000);
    this.fromToDelta  = this.options.to-this.options.from;
    this.totalTime    = this.finishOn-this.startOn;
    this.totalFrames  = this.options.fps*this.options.duration;

    this.render = (function() {
      function dispatch(effect, eventName) {
        if (effect.options[eventName + 'Internal'])
          effect.options[eventName + 'Internal'](effect);
        if (effect.options[eventName])
          effect.options[eventName](effect);
      }

      return function(pos) {
        if (this.state === "idle") {
          this.state = "running";
          dispatch(this, 'beforeSetup');
          if (this.setup) this.setup();
          dispatch(this, 'afterSetup');
        }
        if (this.state === "running") {
          pos = (this.options.transition(pos) * this.fromToDelta) + this.options.from;
          this.position = pos;
          dispatch(this, 'beforeUpdate');
          if (this.update) this.update(pos);
          dispatch(this, 'afterUpdate');
        }
      };
    })();

    this.event('beforeStart');
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).add(this);
  },
  loop: function(timePos) {
    if (timePos >= this.startOn) {
      if (timePos >= this.finishOn) {
        this.render(1.0);
        this.cancel();
        this.event('beforeFinish');
        if (this.finish) this.finish();
        this.event('afterFinish');
        return;
      }
      var pos   = (timePos - this.startOn) / this.totalTime,
          frame = (pos * this.totalFrames).round();
      if (frame > this.currentFrame) {
        this.render(pos);
        this.currentFrame = frame;
      }
    }
  },
  cancel: function() {
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).remove(this);
    this.state = 'finished';
  },
  event: function(eventName) {
    if (this.options[eventName + 'Internal']) this.options[eventName + 'Internal'](this);
    if (this.options[eventName]) this.options[eventName](this);
  },
  inspect: function() {
    var data = $H();
    for(property in this)
      if (!Object.isFunction(this[property])) data.set(property, this[property]);
    return '#<Effect:' + data.inspect() + ',options:' + $H(this.options).inspect() + '>';
  }
});

Effect.Parallel = Class.create(Effect.Base, {
  initialize: function(effects) {
    this.effects = effects || [];
    this.start(arguments[1]);
  },
  update: function(position) {
    this.effects.invoke('render', position);
  },
  finish: function(position) {
    this.effects.each( function(effect) {
      effect.render(1.0);
      effect.cancel();
      effect.event('beforeFinish');
      if (effect.finish) effect.finish(position);
      effect.event('afterFinish');
    });
  }
});

Effect.Tween = Class.create(Effect.Base, {
  initialize: function(object, from, to) {
    object = Object.isString(object) ? $(object) : object;
    var args = $A(arguments), method = args.last(),
      options = args.length == 5 ? args[3] : null;
    this.method = Object.isFunction(method) ? method.bind(object) :
      Object.isFunction(object[method]) ? object[method].bind(object) :
      function(value) { object[method] = value };
    this.start(Object.extend({ from: from, to: to }, options || { }));
  },
  update: function(position) {
    this.method(position);
  }
});

Effect.Event = Class.create(Effect.Base, {
  initialize: function() {
    this.start(Object.extend({ duration: 0 }, arguments[0] || { }));
  },
  update: Prototype.emptyFunction
});

Effect.Opacity = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    // make this work on IE on elements without 'layout'
    if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
      this.element.setStyle({zoom: 1});
    var options = Object.extend({
      from: this.element.getOpacity() || 0.0,
      to:   1.0
    }, arguments[1] || { });
    this.start(options);
  },
  update: function(position) {
    this.element.setOpacity(position);
  }
});

Effect.Move = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      x:    0,
      y:    0,
      mode: 'relative'
    }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    this.element.makePositioned();
    this.originalLeft = parseFloat(this.element.getStyle('left') || '0');
    this.originalTop  = parseFloat(this.element.getStyle('top')  || '0');
    if (this.options.mode == 'absolute') {
      this.options.x = this.options.x - this.originalLeft;
      this.options.y = this.options.y - this.originalTop;
    }
  },
  update: function(position) {
    this.element.setStyle({
      left: (this.options.x  * position + this.originalLeft).round() + 'px',
      top:  (this.options.y  * position + this.originalTop).round()  + 'px'
    });
  }
});

// for backwards compatibility
Effect.MoveBy = function(element, toTop, toLeft) {
  return new Effect.Move(element,
    Object.extend({ x: toLeft, y: toTop }, arguments[3] || { }));
};

Effect.Scale = Class.create(Effect.Base, {
  initialize: function(element, percent) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      scaleX: true,
      scaleY: true,
      scaleContent: true,
      scaleFromCenter: false,
      scaleMode: 'box',        // 'box' or 'contents' or { } with provided values
      scaleFrom: 100.0,
      scaleTo:   percent
    }, arguments[2] || { });
    this.start(options);
  },
  setup: function() {
    this.restoreAfterFinish = this.options.restoreAfterFinish || false;
    this.elementPositioning = this.element.getStyle('position');

    this.originalStyle = { };
    ['top','left','width','height','fontSize'].each( function(k) {
      this.originalStyle[k] = this.element.style[k];
    }.bind(this));

    this.originalTop  = this.element.offsetTop;
    this.originalLeft = this.element.offsetLeft;

    var fontSize = this.element.getStyle('font-size') || '100%';
    ['em','px','%','pt'].each( function(fontSizeType) {
      if (fontSize.indexOf(fontSizeType)>0) {
        this.fontSize     = parseFloat(fontSize);
        this.fontSizeType = fontSizeType;
      }
    }.bind(this));

    this.factor = (this.options.scaleTo - this.options.scaleFrom)/100;

    this.dims = null;
    if (this.options.scaleMode=='box')
      this.dims = [this.element.offsetHeight, this.element.offsetWidth];
    if (/^content/.test(this.options.scaleMode))
      this.dims = [this.element.scrollHeight, this.element.scrollWidth];
    if (!this.dims)
      this.dims = [this.options.scaleMode.originalHeight,
                   this.options.scaleMode.originalWidth];
  },
  update: function(position) {
    var currentScale = (this.options.scaleFrom/100.0) + (this.factor * position);
    if (this.options.scaleContent && this.fontSize)
      this.element.setStyle({fontSize: this.fontSize * currentScale + this.fontSizeType });
    this.setDimensions(this.dims[0] * currentScale, this.dims[1] * currentScale);
  },
  finish: function(position) {
    if (this.restoreAfterFinish) this.element.setStyle(this.originalStyle);
  },
  setDimensions: function(height, width) {
    var d = { };
    if (this.options.scaleX) d.width = width.round() + 'px';
    if (this.options.scaleY) d.height = height.round() + 'px';
    if (this.options.scaleFromCenter) {
      var topd  = (height - this.dims[0])/2;
      var leftd = (width  - this.dims[1])/2;
      if (this.elementPositioning == 'absolute') {
        if (this.options.scaleY) d.top = this.originalTop-topd + 'px';
        if (this.options.scaleX) d.left = this.originalLeft-leftd + 'px';
      } else {
        if (this.options.scaleY) d.top = -topd + 'px';
        if (this.options.scaleX) d.left = -leftd + 'px';
      }
    }
    this.element.setStyle(d);
  }
});

Effect.Highlight = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({ startcolor: '#ffff99' }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    // Prevent executing on elements not in the layout flow
    if (this.element.getStyle('display')=='none') { this.cancel(); return; }
    // Disable background image during the effect
    this.oldStyle = { };
    if (!this.options.keepBackgroundImage) {
      this.oldStyle.backgroundImage = this.element.getStyle('background-image');
      this.element.setStyle({backgroundImage: 'none'});
    }
    if (!this.options.endcolor)
      this.options.endcolor = this.element.getStyle('background-color').parseColor('#ffffff');
    if (!this.options.restorecolor)
      this.options.restorecolor = this.element.getStyle('background-color');
    // init color calculations
    this._base  = $R(0,2).map(function(i){ return parseInt(this.options.startcolor.slice(i*2+1,i*2+3),16) }.bind(this));
    this._delta = $R(0,2).map(function(i){ return parseInt(this.options.endcolor.slice(i*2+1,i*2+3),16)-this._base[i] }.bind(this));
  },
  update: function(position) {
    this.element.setStyle({backgroundColor: $R(0,2).inject('#',function(m,v,i){
      return m+((this._base[i]+(this._delta[i]*position)).round().toColorPart()); }.bind(this)) });
  },
  finish: function() {
    this.element.setStyle(Object.extend(this.oldStyle, {
      backgroundColor: this.options.restorecolor
    }));
  }
});

Effect.ScrollTo = function(element) {
  var options = arguments[1] || { },
  scrollOffsets = document.viewport.getScrollOffsets(),
  elementOffsets = $(element).cumulativeOffset();

  if (options.offset) elementOffsets[1] += options.offset;

  return new Effect.Tween(null,
    scrollOffsets.top,
    elementOffsets[1],
    options,
    function(p){ scrollTo(scrollOffsets.left, p.round()); }
  );
};

/* ------------- combination effects ------------- */

Effect.Fade = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  var options = Object.extend({
    from: element.getOpacity() || 1.0,
    to:   0.0,
    afterFinishInternal: function(effect) {
      if (effect.options.to!=0) return;
      effect.element.hide().setStyle({opacity: oldOpacity});
    }
  }, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Appear = function(element) {
  element = $(element);
  var options = Object.extend({
  from: (element.getStyle('display') == 'none' ? 0.0 : element.getOpacity() || 0.0),
  to:   1.0,
  // force Safari to render floated elements properly
  afterFinishInternal: function(effect) {
    effect.element.forceRerendering();
  },
  beforeSetup: function(effect) {
    effect.element.setOpacity(effect.options.from).show();
  }}, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Puff = function(element) {
  element = $(element);
  var oldStyle = {
    opacity: element.getInlineOpacity(),
    position: element.getStyle('position'),
    top:  element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height
  };
  return new Effect.Parallel(
   [ new Effect.Scale(element, 200,
      { sync: true, scaleFromCenter: true, scaleContent: true, restoreAfterFinish: true }),
     new Effect.Opacity(element, { sync: true, to: 0.0 } ) ],
     Object.extend({ duration: 1.0,
      beforeSetupInternal: function(effect) {
        Position.absolutize(effect.effects[0].element);
      },
      afterFinishInternal: function(effect) {
         effect.effects[0].element.hide().setStyle(oldStyle); }
     }, arguments[1] || { })
   );
};

Effect.BlindUp = function(element) {
  element = $(element);
  element.makeClipping();
  return new Effect.Scale(element, 0,
    Object.extend({ scaleContent: false,
      scaleX: false,
      restoreAfterFinish: true,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping();
      }
    }, arguments[1] || { })
  );
};

Effect.BlindDown = function(element) {
  element = $(element);
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: 0,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping();
    }
  }, arguments[1] || { }));
};

Effect.SwitchOff = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  return new Effect.Appear(element, Object.extend({
    duration: 0.4,
    from: 0,
    transition: Effect.Transitions.flicker,
    afterFinishInternal: function(effect) {
      new Effect.Scale(effect.element, 1, {
        duration: 0.3, scaleFromCenter: true,
        scaleX: false, scaleContent: false, restoreAfterFinish: true,
        beforeSetup: function(effect) {
          effect.element.makePositioned().makeClipping();
        },
        afterFinishInternal: function(effect) {
          effect.element.hide().undoClipping().undoPositioned().setStyle({opacity: oldOpacity});
        }
      });
    }
  }, arguments[1] || { }));
};

Effect.DropOut = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left'),
    opacity: element.getInlineOpacity() };
  return new Effect.Parallel(
    [ new Effect.Move(element, {x: 0, y: 100, sync: true }),
      new Effect.Opacity(element, { sync: true, to: 0.0 }) ],
    Object.extend(
      { duration: 0.5,
        beforeSetup: function(effect) {
          effect.effects[0].element.makePositioned();
        },
        afterFinishInternal: function(effect) {
          effect.effects[0].element.hide().undoPositioned().setStyle(oldStyle);
        }
      }, arguments[1] || { }));
};

Effect.Shake = function(element) {
  element = $(element);
  var options = Object.extend({
    distance: 20,
    duration: 0.5
  }, arguments[1] || {});
  var distance = parseFloat(options.distance);
  var split = parseFloat(options.duration) / 10.0;
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left') };
    return new Effect.Move(element,
      { x:  distance, y: 0, duration: split, afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance, y: 0, duration: split, afterFinishInternal: function(effect) {
        effect.element.undoPositioned().setStyle(oldStyle);
  }}); }}); }}); }}); }}); }});
};

Effect.SlideDown = function(element) {
  element = $(element).cleanWhitespace();
  // SlideDown need to have the content of the element wrapped in a container element with fixed height!
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: window.opera ? 0 : 1,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom}); }
    }, arguments[1] || { })
  );
};

Effect.SlideUp = function(element) {
  element = $(element).cleanWhitespace();
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, window.opera ? 0 : 1,
   Object.extend({ scaleContent: false,
    scaleX: false,
    scaleMode: 'box',
    scaleFrom: 100,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom});
    }
   }, arguments[1] || { })
  );
};

// Bug in opera makes the TD containing this element expand for a instance after finish
Effect.Squish = function(element) {
  return new Effect.Scale(element, window.opera ? 1 : 0, {
    restoreAfterFinish: true,
    beforeSetup: function(effect) {
      effect.element.makeClipping();
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping();
    }
  });
};

Effect.Grow = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.full
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var initialMoveX, initialMoveY;
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      initialMoveX = initialMoveY = moveX = moveY = 0;
      break;
    case 'top-right':
      initialMoveX = dims.width;
      initialMoveY = moveY = 0;
      moveX = -dims.width;
      break;
    case 'bottom-left':
      initialMoveX = moveX = 0;
      initialMoveY = dims.height;
      moveY = -dims.height;
      break;
    case 'bottom-right':
      initialMoveX = dims.width;
      initialMoveY = dims.height;
      moveX = -dims.width;
      moveY = -dims.height;
      break;
    case 'center':
      initialMoveX = dims.width / 2;
      initialMoveY = dims.height / 2;
      moveX = -dims.width / 2;
      moveY = -dims.height / 2;
      break;
  }

  return new Effect.Move(element, {
    x: initialMoveX,
    y: initialMoveY,
    duration: 0.01,
    beforeSetup: function(effect) {
      effect.element.hide().makeClipping().makePositioned();
    },
    afterFinishInternal: function(effect) {
      new Effect.Parallel(
        [ new Effect.Opacity(effect.element, { sync: true, to: 1.0, from: 0.0, transition: options.opacityTransition }),
          new Effect.Move(effect.element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition }),
          new Effect.Scale(effect.element, 100, {
            scaleMode: { originalHeight: dims.height, originalWidth: dims.width },
            sync: true, scaleFrom: window.opera ? 1 : 0, transition: options.scaleTransition, restoreAfterFinish: true})
        ], Object.extend({
             beforeSetup: function(effect) {
               effect.effects[0].element.setStyle({height: '0px'}).show();
             },
             afterFinishInternal: function(effect) {
               effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle);
             }
           }, options)
      );
    }
  });
};

Effect.Shrink = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.none
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      moveX = moveY = 0;
      break;
    case 'top-right':
      moveX = dims.width;
      moveY = 0;
      break;
    case 'bottom-left':
      moveX = 0;
      moveY = dims.height;
      break;
    case 'bottom-right':
      moveX = dims.width;
      moveY = dims.height;
      break;
    case 'center':
      moveX = dims.width / 2;
      moveY = dims.height / 2;
      break;
  }

  return new Effect.Parallel(
    [ new Effect.Opacity(element, { sync: true, to: 0.0, from: 1.0, transition: options.opacityTransition }),
      new Effect.Scale(element, window.opera ? 1 : 0, { sync: true, transition: options.scaleTransition, restoreAfterFinish: true}),
      new Effect.Move(element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition })
    ], Object.extend({
         beforeStartInternal: function(effect) {
           effect.effects[0].element.makePositioned().makeClipping();
         },
         afterFinishInternal: function(effect) {
           effect.effects[0].element.hide().undoClipping().undoPositioned().setStyle(oldStyle); }
       }, options)
  );
};

Effect.Pulsate = function(element) {
  element = $(element);
  var options    = arguments[1] || { },
    oldOpacity = element.getInlineOpacity(),
    transition = options.transition || Effect.Transitions.linear,
    reverser   = function(pos){
      return 1 - transition((-Math.cos((pos*(options.pulses||5)*2)*Math.PI)/2) + .5);
    };

  return new Effect.Opacity(element,
    Object.extend(Object.extend({  duration: 2.0, from: 0,
      afterFinishInternal: function(effect) { effect.element.setStyle({opacity: oldOpacity}); }
    }, options), {transition: reverser}));
};

Effect.Fold = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height };
  element.makeClipping();
  return new Effect.Scale(element, 5, Object.extend({
    scaleContent: false,
    scaleX: false,
    afterFinishInternal: function(effect) {
    new Effect.Scale(element, 1, {
      scaleContent: false,
      scaleY: false,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping().setStyle(oldStyle);
      } });
  }}, arguments[1] || { }));
};

Effect.Morph = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      style: { }
    }, arguments[1] || { });

    if (!Object.isString(options.style)) this.style = $H(options.style);
    else {
      if (options.style.include(':'))
        this.style = options.style.parseStyle();
      else {
        this.element.addClassName(options.style);
        this.style = $H(this.element.getStyles());
        this.element.removeClassName(options.style);
        var css = this.element.getStyles();
        this.style = this.style.reject(function(style) {
          return style.value == css[style.key];
        });
        options.afterFinishInternal = function(effect) {
          effect.element.addClassName(effect.options.style);
          effect.transforms.each(function(transform) {
            effect.element.style[transform.style] = '';
          });
        };
      }
    }
    this.start(options);
  },

  setup: function(){
    function parseColor(color){
      if (!color || ['rgba(0, 0, 0, 0)','transparent'].include(color)) color = '#ffffff';
      color = color.parseColor();
      return $R(0,2).map(function(i){
        return parseInt( color.slice(i*2+1,i*2+3), 16 );
      });
    }
    this.transforms = this.style.map(function(pair){
      var property = pair[0], value = pair[1], unit = null;

      if (value.parseColor('#zzzzzz') != '#zzzzzz') {
        value = value.parseColor();
        unit  = 'color';
      } else if (property == 'opacity') {
        value = parseFloat(value);
        if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
          this.element.setStyle({zoom: 1});
      } else if (Element.CSS_LENGTH.test(value)) {
          var components = value.match(/^([\+\-]?[0-9\.]+)(.*)$/);
          value = parseFloat(components[1]);
          unit = (components.length == 3) ? components[2] : null;
      }

      var originalValue = this.element.getStyle(property);
      return {
        style: property.camelize(),
        originalValue: unit=='color' ? parseColor(originalValue) : parseFloat(originalValue || 0),
        targetValue: unit=='color' ? parseColor(value) : value,
        unit: unit
      };
    }.bind(this)).reject(function(transform){
      return (
        (transform.originalValue == transform.targetValue) ||
        (
          transform.unit != 'color' &&
          (isNaN(transform.originalValue) || isNaN(transform.targetValue))
        )
      );
    });
  },
  update: function(position) {
    var style = { }, transform, i = this.transforms.length;
    while(i--)
      style[(transform = this.transforms[i]).style] =
        transform.unit=='color' ? '#'+
          (Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position)).toColorPart() +
          (Math.round(transform.originalValue[1]+
            (transform.targetValue[1]-transform.originalValue[1])*position)).toColorPart() +
          (Math.round(transform.originalValue[2]+
            (transform.targetValue[2]-transform.originalValue[2])*position)).toColorPart() :
        (transform.originalValue +
          (transform.targetValue - transform.originalValue) * position).toFixed(3) +
            (transform.unit === null ? '' : transform.unit);
    this.element.setStyle(style, true);
  }
});

Effect.Transform = Class.create({
  initialize: function(tracks){
    this.tracks  = [];
    this.options = arguments[1] || { };
    this.addTracks(tracks);
  },
  addTracks: function(tracks){
    tracks.each(function(track){
      track = $H(track);
      var data = track.values().first();
      this.tracks.push($H({
        ids:     track.keys().first(),
        effect:  Effect.Morph,
        options: { style: data }
      }));
    }.bind(this));
    return this;
  },
  play: function(){
    return new Effect.Parallel(
      this.tracks.map(function(track){
        var ids = track.get('ids'), effect = track.get('effect'), options = track.get('options');
        var elements = [$(ids) || $$(ids)].flatten();
        return elements.map(function(e){ return new effect(e, Object.extend({ sync:true }, options)) });
      }).flatten(),
      this.options
    );
  }
});

Element.CSS_PROPERTIES = $w(
  'backgroundColor backgroundPosition borderBottomColor borderBottomStyle ' +
  'borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth ' +
  'borderRightColor borderRightStyle borderRightWidth borderSpacing ' +
  'borderTopColor borderTopStyle borderTopWidth bottom clip color ' +
  'fontSize fontWeight height left letterSpacing lineHeight ' +
  'marginBottom marginLeft marginRight marginTop markerOffset maxHeight '+
  'maxWidth minHeight minWidth opacity outlineColor outlineOffset ' +
  'outlineWidth paddingBottom paddingLeft paddingRight paddingTop ' +
  'right textIndent top width wordSpacing zIndex');

Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;

String.__parseStyleElement = document.createElement('div');
String.prototype.parseStyle = function(){
  var style, styleRules = $H();
  if (Prototype.Browser.WebKit)
    style = new Element('div',{style:this}).style;
  else {
    String.__parseStyleElement.innerHTML = '<div style="' + this + '"></div>';
    style = String.__parseStyleElement.childNodes[0].style;
  }

  Element.CSS_PROPERTIES.each(function(property){
    if (style[property]) styleRules.set(property, style[property]);
  });

  if (Prototype.Browser.IE && this.include('opacity'))
    styleRules.set('opacity', this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1]);

  return styleRules;
};

if (document.defaultView && document.defaultView.getComputedStyle) {
  Element.getStyles = function(element) {
    var css = document.defaultView.getComputedStyle($(element), null);
    return Element.CSS_PROPERTIES.inject({ }, function(styles, property) {
      styles[property] = css[property];
      return styles;
    });
  };
} else {
  Element.getStyles = function(element) {
    element = $(element);
    var css = element.currentStyle, styles;
    styles = Element.CSS_PROPERTIES.inject({ }, function(results, property) {
      results[property] = css[property];
      return results;
    });
    if (!styles.opacity) styles.opacity = element.getOpacity();
    return styles;
  };
}

Effect.Methods = {
  morph: function(element, style) {
    element = $(element);
    new Effect.Morph(element, Object.extend({ style: style }, arguments[2] || { }));
    return element;
  },
  visualEffect: function(element, effect, options) {
    element = $(element);
    var s = effect.dasherize().camelize(), klass = s.charAt(0).toUpperCase() + s.substring(1);
    new Effect[klass](element, options);
    return element;
  },
  highlight: function(element, options) {
    element = $(element);
    new Effect.Highlight(element, options);
    return element;
  }
};

$w('fade appear grow shrink fold blindUp blindDown slideUp slideDown '+
  'pulsate shake puff squish switchOff dropOut').each(
  function(effect) {
    Effect.Methods[effect] = function(element, options){
      element = $(element);
      Effect[effect.charAt(0).toUpperCase() + effect.substring(1)](element, options);
      return element;
    };
  }
);

$w('getInlineOpacity forceRerendering setContentZoom collectTextNodes collectTextNodesIgnoreClass getStyles').each(
  function(f) { Effect.Methods[f] = Element[f]; }
);

Element.addMethods(Effect.Methods);
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// formatDate :
// a PHP date like function, for formatting date strings
// authored by Svend Tofte <www.svendtofte.com>
// the code is in the public domain
//
// see http://www.svendtofte.com/code/date_format/
// and http://www.php.net/date
//
// thanks to 
//  - Daniel Berlin <mail@daniel-berlin.de>,
//    major overhaul and improvements
//  - Matt Bannon,
//    correcting some stupid bugs in my days-in-the-months list!
//
// input : format string
// time : epoch time (seconds, and optional)
//
// if time is not passed, formatting is based on 
// the current "this" date object's set time.
//
// supported switches are
// a, A, B, c, d, D, F, g, G, h, H, i, I (uppercase i), j, l (lowercase L),
// L, m, M, n, N, O, P, r, s, S, t, U, w, W, y, Y, z, Z
// 
// unsupported (as compared to date in PHP 5.1.3)
// T, e, o

Date.prototype.formatDate = function (input,time) {
	
	// removed their hard-coded string arrays and moved to loc
	var daysLong = '_Dates.Weekdays'.loc().split(',');
	var daysFull = '_Dates.LongWeekdays'.loc().split(',');
	var daysShort = '_Dates.ShortWeekdays'.loc().split(',');
	var monthsShort = '_Dates.Months'.loc().split(',');
	var monthsLong = '_Dates.LongMonths'.loc().split(',');
	var ampm = '_Dates.AMPM'.loc().split(',');

	var switches = { // switches object
		
		a : function () {
			// Lowercase Ante meridiem and Post meridiem
			// modified to use loc array
			return ampm[Math.floor(date.getHours()/12)];
		},
		
		A : function () {
			// Uppercase Ante meridiem and Post meridiem
			return (this.a().toUpperCase());
		},
	
		B : function (){
			// Swatch internet time. code simply grabbed from ppk,
			// since I was feeling lazy:
			// http://www.xs4all.nl/~ppk/js/beat.html
			var off = (date.getTimezoneOffset() + 60)*60;
			var theSeconds = (date.getHours() * 3600) + 
							 (date.getMinutes() * 60) + 
							  date.getSeconds() + off;
			var beat = Math.floor(theSeconds/86.4);
			if (beat > 1000) beat -= 1000;
			if (beat < 0) beat += 1000;
			if ((String(beat)).length == 1) beat = "00"+beat;
			if ((String(beat)).length == 2) beat = "0"+beat;
			return beat;
		},
		
		c : function () {
			// ISO 8601 date (e.g.: "2004-02-12T15:19:21+00:00"), as per
			// http://www.cl.cam.ac.uk/~mgk25/iso-time.html
			return (this.Y() + "-" + this.m() + "-" + this.d() + "T" + 
					this.h() + ":" + this.i() + ":" + this.s() + this.P());
		},
		
		d : function () {
			// Day of the month, 2 digits with leading zeros
			var j = String(this.j());
			return (j.length == 1 ? "0"+j : j);
		},
		
		D : function () {
			// A textual representation of a day, three letters
			return daysShort[date.getDay()];
		},
		
		F : function () {
			// A full textual representation of a month
			return monthsLong[date.getMonth()];
		},
		
		g : function () {
			// 12-hour format of an hour without leading zeros
			return date.getHours() > 12? date.getHours()-12 : (date.getHours()==0?12:date.getHours());
		},
		
		G : function () {
			// 24-hour format of an hour without leading zeros
			return date.getHours();
		},
		
		h : function () {
			// 12-hour format of an hour with leading zeros
			var g = String(this.g());
			return (g.length == 1 ? "0"+g : g);
		},
		
		H : function () {
			// 24-hour format of an hour with leading zeros
			var G = String(this.G());
			return (G.length == 1 ? "0"+G : G);
		},
		
		i : function () {
			// Minutes with leading zeros
			var min = String (date.getMinutes ());
			return (min.length == 1 ? "0" + min : min);
		},
		
		I : function () {
			// Whether or not the date is in daylight saving time (DST)
			// note that this has no bearing in actual DST mechanics,
			// and is just a pure guess. buyer beware.
			var noDST = new Date ("January 1 " + this.Y() + " 00:00:00");
			return (noDST.getTimezoneOffset () == 
					date.getTimezoneOffset () ? 0 : 1);
		},
		
		j : function () {
			// Day of the month without leading zeros
			return date.getDate();
		},
		
		l : function () {
			// A full textual representation of the day of the week
			return daysLong[date.getDay()];
		},
		
		x : function () {
			// Overload x to get proper full textual representation of the day of the week.
			return daysFull[date.getDay()];
		},
		
		L : function () {
			// leap year or not. 1 if leap year, 0 if not.
			// the logic should match iso's 8601 standard.
			// http://www.uic.edu/depts/accc/software/isodates/leapyear.html
			var Y = this.Y();
			if (         
				(Y % 4 == 0 && Y % 100 != 0) ||
				(Y % 4 == 0 && Y % 100 == 0 && Y % 400 == 0)
				) {
				return 1;
			} else {
				return 0;
			}
		},
		
		m : function () {
			// Numeric representation of a month, with leading zeros
			var n = String(this.n());
			return (n.length == 1 ? "0"+n : n);
		},
		
		M : function () {
			// A short textual representation of a month, three letters
			return monthsShort[date.getMonth()];
		},
		
		n : function () {
			// Numeric representation of a month, without leading zeros
			return date.getMonth()+1;
		},
		
		N : function () {
			// ISO-8601 numeric representation of the day of the week
			var w = this.w();
			return (w == 0 ? 7 : w);
		},
		
		O : function () {
			// Difference to Greenwich time (GMT) in hours
			var os = Math.abs(date.getTimezoneOffset());
			var h = String(Math.floor(os/60));
			var m = String(os%60);
			h.length == 1? h = "0"+h:1;
			m.length == 1? m = "0"+m:1;
			return date.getTimezoneOffset() < 0 ? "+"+h+m : "-"+h+m;
		},
		
		P : function () {
			// Difference to GMT, with colon between hours and minutes
			var O = this.O();
			return (O.substr(0, 3) + ":" + O.substr(3, 2));
		},      
		
		r : function () {
			// RFC 822 formatted date
			var r; // result
			//  Thu         ,     21               Dec              2000
			r = this.D() + ", " + this.d() + " " + this.M() + " " + this.Y() +
			//    16          :    01          :    07               0200
			" " + this.H() + ":" + this.i() + ":" + this.s() + " " + this.O();
			return r;
		},

		s : function () {
			// Seconds, with leading zeros
			var sec = String (date.getSeconds ());
			return (sec.length == 1 ? "0" + sec : sec);
		},        
		
		S : function () {
			// English ordinal suffix for the day of the month, 2 characters
			switch (date.getDate ()) {
				case  1: return ("st"); 
				case  2: return ("nd"); 
				case  3: return ("rd");
				case 21: return ("st"); 
				case 22: return ("nd"); 
				case 23: return ("rd");
				case 31: return ("st");
				default: return ("th");
			}
		},
		
		t : function () {
			// thanks to Matt Bannon for some much needed code-fixes here!
			var daysinmonths = [null,31,28,31,30,31,30,31,31,30,31,30,31];
			if (this.L()==1 && this.n()==2) return 29; // ~leap day
			return daysinmonths[this.n()];
		},
		
		U : function () {
			// Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)
			return Math.round(date.getTime()/1000);
		},

		w : function () {
			// Numeric representation of the day of the week
			return date.getDay();
		},
		
		W : function () {
			// Weeknumber, as per ISO specification:
			// http://www.cl.cam.ac.uk/~mgk25/iso-time.html
		
			var DoW = this.N ();
			var DoY = this.z ();

			// If the day is 3 days before New Year's Eve and is Thursday or earlier,
			// it's week 1 of next year.
			var daysToNY = 364 + this.L () - DoY;
			if (daysToNY <= 2 && DoW <= (3 - daysToNY)) {
				return 1;
			}

			// If the day is within 3 days after New Year's Eve and is Friday or later,
			// it belongs to the old year.
			if (DoY <= 2 && DoW >= 5) {
				return new Date (this.Y () - 1, 11, 31).formatDate ("W");
			}
			
			var nyDoW = new Date (this.Y (), 0, 1).getDay ();
			nyDoW = nyDoW != 0 ? nyDoW - 1 : 6;

			if (nyDoW <= 3) { // First day of the year is a Thursday or earlier
				return (1 + Math.floor ((DoY + nyDoW) / 7));
			} else {  // First day of the year is a Friday or later
				return (1 + Math.floor ((DoY - (7 - nyDoW)) / 7));
			}
		},
		
		y : function () {
			// A two-digit representation of a year
			var y = String(this.Y());
			return y.substring(y.length-2,y.length);
		},        
		
		Y : function () {
			// A full numeric representation of a year, 4 digits
	
			// we first check, if getFullYear is supported. if it
			// is, we just use that. ppks code is nice, but wont
			// work with dates outside 1900-2038, or something like that
			if (date.getFullYear) {
				var newDate = new Date("January 1 2001 00:00:00 +0000");
				var x = newDate .getFullYear();
				if (x == 2001) {              
					// i trust the method now
					return date.getFullYear();
				}
			}
			// else, do this:
			// codes thanks to ppk:
			// http://www.xs4all.nl/~ppk/js/introdate.html
			var x = date.getYear();
			var y = x % 100;
			y += (y < 38) ? 2000 : 1900;
			return y;
		},

		
		z : function () {
			// The day of the year, zero indexed! 0 through 366
			var t = new Date("January 1 " + this.Y() + " 00:00:00");
			var diff = date.getTime() - t.getTime();
			return Math.floor(diff/1000/60/60/24);
		},

		Z : function () {
			// Timezone offset in seconds
			return (date.getTimezoneOffset () * -60);
		}        
	
	}

	function getSwitch(str) {
		if (switches[str] != undefined) {
			return switches[str]();
		} else {
			return str;
		}
	}

	var date;
	if (time) {
		var date = new Date (time);
	} else {
		var date = this;
	}

	var formatString = input.split("");
	var i = 0;
	while (i < formatString.length) {
		if (formatString[i] == "\\") {
			// this is our way of allowing users to escape stuff
			formatString.splice(i,1);
		} else {
			formatString[i] = getSwitch(formatString[i]);
		}
		i++;
	}
	
	return formatString.join("");
}


// Some (not all) predefined format strings from PHP 5.1.1, which 
// offer standard date representations.
// See: http://www.php.net/manual/en/ref.datetime.php#datetime.constants
//

// Atom      "2005-08-15T15:52:01+00:00"
Date.DATE_ATOM    = "Y-m-d\\TH:i:sP";
// ISO-8601  "2005-08-15T15:52:01+0000"
Date.DATE_ISO8601 = "Y-m-d\\TH:i:sO";
// RFC 2822  "Mon, 15 Aug 2005 15:52:01 +0000"
Date.DATE_RFC2822 = "D, d M Y H:i:s O";
// W3C       "2005-08-15T15:52:01+00:00"
Date.DATE_W3C     = "Y-m-d\\TH:i:sP";
if (window.loaded) loaded('formatDate.js');
/*!

 handlebars v1.1.2

Copyright (C) 2011 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/

var Handlebars = (function() {
// handlebars/safe-string.js
var __module3__ = (function() {
  "use strict";
  var __exports__;
  // Build out our basic SafeString type
  function SafeString(string) {
    this.string = string;
  }

  SafeString.prototype.toString = function() {
    return "" + this.string;
  };

  __exports__ = SafeString;
  return __exports__;
})();

// handlebars/utils.js
var __module2__ = (function(__dependency1__) {
  "use strict";
  var __exports__ = {};
  var SafeString = __dependency1__;

  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;

  function escapeChar(chr) {
    return escape[chr] || "&amp;";
  }

  function extend(obj, value) {
    for(var key in value) {
      if(value.hasOwnProperty(key)) {
        obj[key] = value[key];
      }
    }
  }

  __exports__.extend = extend;var toString = Object.prototype.toString;
  __exports__.toString = toString;
  // Sourced from lodash
  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  var isFunction = function(value) {
    return typeof value === 'function';
  };
  // fallback for older versions of Chrome and Safari
  if (isFunction(/x/)) {
    isFunction = function(value) {
      return typeof value === 'function' && toString.call(value) === '[object Function]';
    };
  }
  var isFunction;
  __exports__.isFunction = isFunction;
  var isArray = Array.isArray || function(value) {
    return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
  };
  __exports__.isArray = isArray;

  function escapeExpression(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof SafeString) {
      return string.toString();
    } else if (!string && string !== 0) {
      return "";
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = "" + string;

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  }

  __exports__.escapeExpression = escapeExpression;function isEmpty(value) {
    if (!value && value !== 0) {
      return true;
    } else if (isArray(value) && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  __exports__.isEmpty = isEmpty;
  return __exports__;
})(__module3__);

// handlebars/exception.js
var __module4__ = (function() {
  "use strict";
  var __exports__;

  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  function Exception(/* message */) {
    var tmp = Error.prototype.constructor.apply(this, arguments);

    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }
  }

  Exception.prototype = new Error();

  __exports__ = Exception;
  return __exports__;
})();

// handlebars/base.js
var __module1__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  /*globals Exception, Utils */
  var Utils = __dependency1__;
  var Exception = __dependency2__;

  var VERSION = "1.1.2";
  __exports__.VERSION = VERSION;var COMPILER_REVISION = 4;
  __exports__.COMPILER_REVISION = COMPILER_REVISION;
  var REVISION_CHANGES = {
    1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '>= 1.0.0'
  };
  __exports__.REVISION_CHANGES = REVISION_CHANGES;
  var isArray = Utils.isArray,
      isFunction = Utils.isFunction,
      toString = Utils.toString,
      objectType = '[object Object]';

  function HandlebarsEnvironment(helpers, partials) {
    this.helpers = helpers || {};
    this.partials = partials || {};

    registerDefaultHelpers(this);
  }

  __exports__.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
    constructor: HandlebarsEnvironment,

    logger: logger,
    log: log,

    registerHelper: function(name, fn, inverse) {
      if (toString.call(name) === objectType) {
        if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
        Utils.extend(this.helpers, name);
      } else {
        if (inverse) { fn.not = inverse; }
        this.helpers[name] = fn;
      }
    },

    registerPartial: function(name, str) {
      if (toString.call(name) === objectType) {
        Utils.extend(this.partials,  name);
      } else {
        this.partials[name] = str;
      }
    }
  };

  function registerDefaultHelpers(instance) {
    instance.registerHelper('helperMissing', function(arg) {
      if(arguments.length === 2) {
        return undefined;
      } else {
        throw new Error("Missing helper: '" + arg + "'");
      }
    });

    instance.registerHelper('blockHelperMissing', function(context, options) {
      var inverse = options.inverse || function() {}, fn = options.fn;

      if (isFunction(context)) { context = context.call(this); }

      if(context === true) {
        return fn(this);
      } else if(context === false || context == null) {
        return inverse(this);
      } else if (isArray(context)) {
        if(context.length > 0) {
          return instance.helpers.each(context, options);
        } else {
          return inverse(this);
        }
      } else {
        return fn(context);
      }
    });

    instance.registerHelper('each', function(context, options) {
      var fn = options.fn, inverse = options.inverse;
      var i = 0, ret = "", data;

      if (isFunction(context)) { context = context.call(this); }

      if (options.data) {
        data = createFrame(options.data);
      }

      if(context && typeof context === 'object') {
        if (isArray(context)) {
          for(var j = context.length; i<j; i++) {
            if (data) {
              data.index = i;
              data.first = (i === 0)
              data.last  = (i === (context.length-1));
            }
            ret = ret + fn(context[i], { data: data });
          }
        } else {
          for(var key in context) {
            if(context.hasOwnProperty(key)) {
              if(data) { data.key = key; }
              ret = ret + fn(context[key], {data: data});
              i++;
            }
          }
        }
      }

      if(i === 0){
        ret = inverse(this);
      }

      return ret;
    });

    instance.registerHelper('if', function(conditional, options) {
      if (isFunction(conditional)) { conditional = conditional.call(this); }

      // Default behavior is to render the positive path if the value is truthy and not empty.
      // The `includeZero` option may be set to treat the condtional as purely not empty based on the
      // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
      if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    });

    instance.registerHelper('unless', function(conditional, options) {
      return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
    });

    instance.registerHelper('with', function(context, options) {
      if (isFunction(context)) { context = context.call(this); }

      if (!Utils.isEmpty(context)) return options.fn(context);
    });

    instance.registerHelper('log', function(context, options) {
      var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
      instance.log(level, context);
    });
  }

  var logger = {
    methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

    // State enum
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    level: 3,

    // can be overridden in the host environment
    log: function(level, obj) {
      if (logger.level <= level) {
        var method = logger.methodMap[level];
        if (typeof console !== 'undefined' && console[method]) {
          console[method].call(console, obj);
        }
      }
    }
  };
  __exports__.logger = logger;
  function log(level, obj) { logger.log(level, obj); }

  __exports__.log = log;var createFrame = function(object) {
    var obj = {};
    Utils.extend(obj, object);
    return obj;
  };
  __exports__.createFrame = createFrame;
  return __exports__;
})(__module2__, __module4__);

// handlebars/runtime.js
var __module5__ = (function(__dependency1__, __dependency2__, __dependency3__) {
  "use strict";
  var __exports__ = {};
  /*global Utils */
  var Utils = __dependency1__;
  var Exception = __dependency2__;
  var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
  var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;

  function checkRevision(compilerInfo) {
    var compilerRevision = compilerInfo && compilerInfo[0] || 1,
        currentRevision = COMPILER_REVISION;

    if (compilerRevision !== currentRevision) {
      if (compilerRevision < currentRevision) {
        var runtimeVersions = REVISION_CHANGES[currentRevision],
            compilerVersions = REVISION_CHANGES[compilerRevision];
        throw new Error("Template was precompiled with an older version of Handlebars than the current runtime. "+
              "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
      } else {
        // Use the embedded version info since the runtime doesn't know about this revision yet
        throw new Error("Template was precompiled with a newer version of Handlebars than the current runtime. "+
              "Please update your runtime to a newer version ("+compilerInfo[1]+").");
      }
    }
  }

  // TODO: Remove this line and break up compilePartial

  function template(templateSpec, env) {
    if (!env) {
      throw new Error("No environment passed to template");
    }

    var invokePartialWrapper;
    if (env.compile) {
      invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
        // TODO : Check this for all inputs and the options handling (partial flag, etc). This feels
        // like there should be a common exec path
        var result = invokePartial.apply(this, arguments);
        if (result) { return result; }

        var options = { helpers: helpers, partials: partials, data: data };
        partials[name] = env.compile(partial, { data: data !== undefined }, env);
        return partials[name](context, options);
      };
    } else {
      invokePartialWrapper = function(partial, name /* , context, helpers, partials, data */) {
        var result = invokePartial.apply(this, arguments);
        if (result) { return result; }
        throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
      };
    }

    // Just add water
    var container = {
      escapeExpression: Utils.escapeExpression,
      invokePartial: invokePartialWrapper,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          programWrapper = program(i, fn, data);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = program(i, fn);
        }
        return programWrapper;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common && (param !== common)) {
          ret = {};
          Utils.extend(ret, common);
          Utils.extend(ret, param);
        }
        return ret;
      },
      programWithDepth: programWithDepth,
      noop: noop,
      compilerInfo: null
    };

    return function(context, options) {
      options = options || {};
      var namespace = options.partial ? options : env,
          helpers,
          partials;

      if (!options.partial) {
        helpers = options.helpers;
        partials = options.partials;
      }
      var result = templateSpec.call(
            container,
            namespace, context,
            helpers,
            partials,
            options.data);

      if (!options.partial) {
        checkRevision(container.compilerInfo);
      }

      return result;
    };
  }

  __exports__.template = template;function programWithDepth(i, fn, data /*, $depth */) {
    var args = Array.prototype.slice.call(arguments, 3);

    var prog = function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
    prog.program = i;
    prog.depth = args.length;
    return prog;
  }

  __exports__.programWithDepth = programWithDepth;function program(i, fn, data) {
    var prog = function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
    prog.program = i;
    prog.depth = 0;
    return prog;
  }

  __exports__.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
    var options = { partial: true, helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    }
  }

  __exports__.invokePartial = invokePartial;function noop() { return ""; }

  __exports__.noop = noop;
  return __exports__;
})(__module2__, __module4__, __module1__);

// handlebars.runtime.js
var __module0__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var __exports__;
  var base = __dependency1__;

  // Each of these augment the Handlebars object. No need to setup here.
  // (This is done to easily share code between commonjs and browse envs)
  var SafeString = __dependency2__;
  var Exception = __dependency3__;
  var Utils = __dependency4__;
  var runtime = __dependency5__;

  // For compatibility and usage outside of module systems, make the Handlebars object a namespace
  var create = function() {
    var hb = new base.HandlebarsEnvironment();

    Utils.extend(hb, base);
    hb.SafeString = SafeString;
    hb.Exception = Exception;
    hb.Utils = Utils;

    hb.VM = runtime;
    hb.template = function(spec) {
      return runtime.template(spec, hb);
    };

    return hb;
  };

  var Handlebars = create();
  Handlebars.create = create;

  __exports__ = Handlebars;
  return __exports__;
})(__module1__, __module3__, __module4__, __module2__, __module5__);

  return __module0__;
})();
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */

var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Calculate the HMAC-MD5, of a key and some data
 */
function core_hmac_md5(key, data)
{
  var bkey = str2binl(key);
  if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
  return core_md5(opad.concat(hash), 512 + 128);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert a string to an array of little-endian words
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 */
function str2binl(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
  return bin;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
  return str;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
function binl2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of little-endian words to a base-64 string
 */
function binl2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}

if (window.loaded) loaded('md5.js');
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Simple CSDateTime utility functions.

Date.prototype.toJSON = function(){
	return {
		'type': 'com.apple.DateTime',
		'epochValue': (this.getTime() / 1000),
		'isoValue': this.toISOString()
	}
}

function csDateTimeFromDate(inDate) {
	return {
		'type': 'com.apple.DateTime',
		'epochValue': (inDate.getTime() / 1000),
		'isoValue': inDate.toISOString()
	}
};

function dateFromCSDateTime(inCSDateTime) {
	var newDate = new Date(inCSDateTime.epochValue * 1000);
	return newDate;
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

Element.addMethods({
	getDataAttributes: function(element) {
		var hash = {};
		var attributes = element.attributes;
		var regex = /^data-/;
		for (var i=0, n=attributes.length; i < n; i++) {
			var attribute = attributes[i].name;
			if (regex.match(attribute)) {
				var key = attribute.gsub(regex,'');
				var value = element.readAttribute(attribute);
				hash[key] = value;
			}
		}
		return hash;
	},
	setDataAttributes: function(element, hash) {
		$H(hash).each(function(item) {
			element.writeAttribute('data-' + item.key, item.value);
		});
		return element;
	},
	setClassName: function(element, name, bool) {
		return (bool) ? element.addClassName(name) : element.removeClassName(name);
	},
	getLeft: function(inElement, inOptParent) {
		var parent = inOptParent?$(inOptParent):null;
		var currentNode = $(inElement);
		var currentLeft = 0;
		while (currentNode) {
			currentLeft += currentNode.offsetLeft;
			currentNode = currentNode.offsetParent;
			if (parent && currentNode == parent) {
				currentNode = null;
			}
			if (currentNode && !browser().isIE() && currentNode.nodeName.toLowerCase() == 'body') {
				currentNode = null;
			}
		}
		return currentLeft;
	},
	getTop: function(inElement, inOptParent) {
		var parent = inOptParent?$(inOptParent):null;
		var currentNode = $(inElement);
		var currentTop = 0;
		while (currentNode) {
			currentTop += currentNode.offsetTop;
			currentNode = currentNode.offsetParent;
			if (parent && currentNode == parent) {
				currentNode = null;
			}
			if (currentNode && !browser().isIE() && currentNode.nodeName.toLowerCase() == 'body') {
				currentNode = null;
			}
		}
		return currentTop;
	},
	setOffsetHeight: function(element, height) {
		element = $(element);
		if (height) {
			element.style.height = height+'px';
		}
		else {
			height = parseInt(element.style.height);
		}
		var actual = Element.getHeight(element);
		element.style.height = (height-(actual-height))+'px';
	},
	setOffsetWidth: function(element, width) {
		element = $(element);
		if (width) {
			element.style.width = width+'px';
		}
		else {
			width = parseInt(element.style.width);
		}
		var actual = element.offsetWidth;
		element.style.width = (width-(actual-width))+'px';
	},
	getInvisibleSize: function(inElement) {
		var elm = $(inElement);
		if (Element.visible(inElement)) return [Element.getWidth(inElement), Element.getHeight(inElement)];
		elm.style.visibility = 'hidden';
		Element.show(elm);
		var width = elm.offsetWidth;
		var height = Element.getHeight(elm);
		Element.hide(elm);
		elm.style.visibility = '';
		return [width, height];
	},
	getInvisibleHeight: function(inElement) { // ##5389514
		return Element.getInvisibleSize(inElement)[1];
	},
	isChild: function(inChildElement, inParentElement) { // ##5389516
		return Element.descendantOf(inChildElement, inParentElement);
	},
	/* The unwrap() function removes a child element from a parent matching a given selector. */
	/* inSelector is a CSS selector for a parent tag, and tagBuilderCallback is a function to return a new enclosing tag. */
	/* Don't use inOptParentTag; it's used internally when recursing through the DOM. */
	unwrap: function(inChildElm, inSelector, inTagBuilderCallback, inOptParentElm) {
		inChildElm = $(inChildElm);
		// find the parent element
		var parentElm = inOptParentElm || inChildElm.up(inSelector);
		if (parentElm) {
			// find the child which is an ancestor of the child element
			var ancestor = $A(parentElm.childNodes).detect(function(elm) {
				return (elm == inChildElm || inChildElm.descendantOf(elm));
			});
			// wrap the previous siblings
			if (ancestor && ancestor.previousSibling) {
				var subelm = inTagBuilderCallback();
				while (ancestor.previousSibling) {
					var sibling = ancestor.previousSibling;
					Element.remove(sibling);
					insertAtBeginning(sibling, subelm);
				}
				insertAtBeginning(subelm, parentElm);
			}
			// wrap the next siblings
			if (ancestor && ancestor.nextSibling) {
				var subelm = inTagBuilderCallback();
				while (ancestor.nextSibling) {
					var sibling = ancestor.nextSibling;
					Element.remove(sibling);
					subelm.appendChild(sibling);
				}
				parentElm.appendChild(subelm);
			}
			// if we're not a direct parent, recursively wrap the ancestor
			if (ancestor != inChildElm) {
				Element.unwrap(inChildElm, inSelector, inTagBuilderCallback, ancestor);
			}
			// if we're not being called recursively, remove the parent and child elements (but not their children)
			if (!inOptParentElm) {
				promoteElementChildren(parentElm);
				promoteElementChildren(inChildElm);
			}
		}
	},
	reload: function(inElement, inCallback, optUrl) {
		var elm = $(inElement);
		var inCallback = inCallback || Prototype.emptyFunction;
		if (!elm || !elm.id) { // bail if the element has no ID
			inCallback(false);
			return false;
		}
		// caller can pass in a custom URL... default just reloads the current location.
		var url = optUrl || (window.location.pathname + window.location.search);
		// load this document in an invisible iframe
		var reloadFrame = Builder.node('iframe', {
			name: 'element_reload_'+server().getNextUploadID(),
			style: 'position:absolute;top:0;left:0;width:1px;height:1px;visibility:hidden',
			// IE test
			// use this to debug
			//style: 'visibility:visible;width:200px;height:200px;position:absolute;top:0;left:0;z-index:5000',
			src: 'about:blank'
		});
		d.body.appendChild(reloadFrame);
		var frameWindow = reloadFrame.contentWindow;
		// maybeLoadedCallback -- outermost check, looks for a document and body for the newly added iframe
		// this is a workaround because onload doesn't work in this context
		var maybeLoadedCallback = function() {
			if (frameWindow.document && frameWindow.document.body) {
				// once we have a document and body, do a GET request for the page
				var req = new Ajax.Request(url, {method:'get', onSuccess:function(inTransport) {
					// grab the contents of the BODY tag
					var bodyTextMatch = inTransport.responseText.replace(/[\r\n]/gm, '').match(/<body[^>]*>(.+)<\/body>/);
					if (bodyTextMatch) {
						// populate the body of the iframe with the body tag contents
						frameWindow.document.body.innerHTML = bodyTextMatch[1];
						// now look for the element on this page
						var replacementElement = frameWindow.document.getElementById(elm.id);
						if (replacementElement) {
							elm.update(replacementElement.innerHTML);
							inCallback(true);
						}
						else {
							inCallback(false);
						}
					}
					else { // no body tag -- FAIL
						inCallback(false);
					}
					Element.remove(reloadFrame);
				}});
			}
			else {
				setTimeout(maybeLoadedCallback, 250);
			}
		}
		setTimeout(maybeLoadedCallback, 750);
	},
	enableLinkIfAvailable: function(inElement, inOptCallback) {
		// get the element and its href
		var elm = $(inElement);
		if (!elm) return;
		
		var availability_url = elm.getAttribute('name') || elm.getAttribute('href');
		if (availability_url)
		{
			var href = elm.getAttribute('href');
			// disable
			elm.addClassName('disabled');
			elm.setAttribute('href', '#');
			// now try to re-enable if it's reachable
			new Ajax.Request(availability_url, {
				method: (browser().isWebKit() ? 'get' : 'post'),
				onComplete: function(transport)
				{
					if (transport.status >= 200 && transport.status < 300)
					{
						elm.removeClassName('disabled');
						elm.setAttribute('href', href);
					}
					if (Object.isFunction(inOptCallback)) inOptCallback(elm);
				}
			});
		}
	},
	forceReflow: function(inElement) {
		var elm = $(inElement);
		if (elm && elm.style) {
			Element.hide(elm);
			setTimeout(function() {Element.show(elm)}, 1);
		}
	},
	formatElementDateContents: function(inElement, inOptIsGMT) {
		var elm = $(inElement);
		var d = createDateObjFromISO8601(Element.firstNodeValue(elm), inOptIsGMT);
		if (d) replaceElementContents(elm, Loc.getLongDateString(d));
	},
	// Returns the innerText/textContent of this element.
	textValue: function(inElement, inOptParent) {
		if (!inElement) return "";
		if (inElement.nodeType == 3) return inElement.nodeValue;
		return (inElement.textContent || inElement.innerText || "");
	},
	// Returns the outerHTML equivilant of this element.
	outerHtmlValue: function(inElement) {
		if (!inElement) return undefined;
		if (!('outerHTML' in document.documentElement)) {
			return $(inElement).outerHTML;
		} else {
			var temporaryParent = document.createElement('div');
			temporaryParent.appendChild(inElement.cloneNode(true));
			var _innerHTML = temporaryParent.innerHTML;
			temporaryParent = null;
			return _innerHTML;
		}
	}
});

function changeNodeName(inElement, inNodeName) {
	var elm = $(inElement);
	var node = elm.ownerDocument.createElement(inNodeName);
	$A(elm.childNodes).each(function(child) {
		elm.removeChild(child);
		node.appendChild(child);
	});
	elm.parentNode.insertBefore(node, elm);
	Element.remove(elm);
	return node;
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
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

var CC = CC || new Object();
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
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Breaks a string into an array of tokens.

String.prototype.w = function() {
	var result = [], parts = this.split(' '), length = parts.length;
	for (var idx = 0; idx < length; idx++) {
		var part = parts[idx] ;
		if (part.length !== 0) result.push(part);
	}
	return result;
};

// Returns true if a string is just whitespace.

String.prototype.isWhitespace = function() {
	return this.match(/^[ \t\r\n]+$/);
};

// Substitutes into a string. Borrowed from SproutCore.

String.prototype.fmt = function() {
	var args = arguments;
	var idx  = 0;
	return this.replace(/%@([0-9]+)?/g, function(s, argIndex) {
		argIndex = (argIndex) ? parseInt(argIndex,0) - 1 : idx++;
		s = args[argIndex];
		return ((s === null) ? '(null)' : (s === undefined) ? '' : s).toString(); 
	});
};

// Returns a string with the first character uppercased. We have a seperate method for this
// versus Prototype#capitalize method because Prototype downcases the entire string before
// uppercasing the first character.

String.prototype.capitalizeFirstCharacter = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.trim = function() {
	return this.toString().replace(/^[\s\t\n\r]*|[\s\t\n\r]*$/g,'');
};

// Returns a random string.

var buildRandomString = function(inLength) {
	var result = "";
	var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var idx = 0; idx < (inLength || 5); idx++) {
		result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
	}
	return result;
};

// Does a string look like a GUID?

var looksLikeGUID = function(inString) {
	return (inString || "").match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
};

// Returns the intersection of an array of strings and a given array of strings (an array of items
// where items exist in both arrays). Accepts an optional inDifferenceInstead flag where the difference
// between the first and second arrays will be returned instead (an array of items in the second
// array but NOT in the first).

var stringArrayIntersection = function(firstArray, secondArray, inDifferenceInstead) {
	var shortestArray = firstArray, longestArray = secondArray;
	if (firstArray.length > secondArray.length) {
		longestArray = firstArray;
		shortestArray = secondArray;
	}
	// If we're building the intersection, loop over the shortest array and build
	// a result of keys that exist in the shortest array and the hash we just built.
	// If we're building the difference, do the opposite.
	var hashingArray = (inDifferenceInstead ? shortestArray : longestArray);
	var hash = {}, idx, length = hashingArray.length;
	for (idx = 0; idx < length; idx++) {
		hash[hashingArray[idx]] = true;
	}
	var loopingArray = shortestArray;
	if (inDifferenceInstead) loopingArray = longestArray;
	var value, length = loopingArray.length, result = [];
	for (idx = 0; idx < length; idx++) {
		value = loopingArray[idx];
		if ((value in hash) && !inDifferenceInstead) {
			result.push(value);
		}
		if (inDifferenceInstead && !(value in hash)) {
			result.push(value);
		}
	}
	return result;
};

var stringArrayDifference = function(firstArray, secondArray) {
	return stringArrayIntersection(firstArray, secondArray, true);
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Creates a global that you can use to refer to an instance of a class.  Shared
// instances are referenced using a supplied name, and can be created on-demand or on
// page load (depending on the value of inOptInstantiateOnAwakeFromPage).  Auto-creating
// happens as soon as the document object is available, instead of waiting around for the
// window onload event.

Class.createWithSharedInstance = function(inOptInstanceShortcutName, inOptInstantiateOnAwakeFromPage) {
	var cls = null;
	cls = function() {
		var result = this.initialize.apply(this, arguments);
		if (result == invalidate) {
			var timeoutCallback = function() {
				try {
					if (this && this['_parentClass'] && this['_parentClass']['_sharedInstance'] == this) {
						this['_parentClass']['_sharedInstance'] = null;
					}
				}
				catch(e) {
					throw e;
				}
			}
			setTimeout(timeoutCallback.bind(this), 200);
		}
	}
	cls.autocreate = inOptInstantiateOnAwakeFromPage;
	cls.sharedInstance = function() {
		if (!cls['_sharedInstance']) {
			cls['_sharedInstance'] = new cls();
			cls['_sharedInstance']['_parentClass'] = cls;
		}
		return cls['_sharedInstance'];
	}
	if (inOptInstanceShortcutName) window[inOptInstanceShortcutName] = cls.sharedInstance;
	if (inOptInstantiateOnAwakeFromPage) {
		if (typeof(globalNotificationCenter) !== "undefined") {
			globalNotificationCenter().subscribe('PAGE_INITIALIZE_FINISHED', function() {
				if (cls.autocreate) cls.sharedInstance();
			});
		}
	}
	return cls;
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



// Javascript port of NSNotificationCenter allowing you to broadcasting notifications.
// Basically a notification dispatch table where callback functions can be registered
// and executed when a notification is received matching a given name from a given sender.
// Delivers notifications to observers synchronously.

CC.Notifications = CC.Notifications || new Object();
CC.Notifications.Mixins = CC.Notifications.Mixins || new Object();

// Optimization when broadcasting notifications to a large number of recipients.

CC.Notifications.Mixins.SupportsOptimizedNotifications = {
	mSupportsOptimizedNotifications: true,
	// Returns a unique string identifier representation for this object. Allows us
	// to look up notification recievers for a targeted notification in linear time.
	getNotificationsIdentifer: function() { /* Interface */ }
};

CC.Notifications.GlobalNotificationCenter = Class.createWithSharedInstance('globalNotificationCenter');
CC.Notifications.GlobalNotificationCenter.prototype = {
	initialize: function() {
		// A hash of callback functions keyed by notification identifier.
		this.mGenericSubscribers = {};
		// A hash of targeted callbacks keyed by notification identifer.
		this.mTargetedSubscribers = {};
		// An optimized hash of targeted callbacks keyed by message name and notification identifier.
		this.mOptimizedTargetedSubscribers = {};
	},
	publish: function(inMessage, inObject, inOptExtras) {
		if (!inMessage) return false;
		var shouldNotifyGenericSubscribers = true;
		if (inObject != undefined) {
			// Notify any targeted subscribers.
			if (inObject.mSupportsOptimizedNotifications) {
				var optimized = this.mOptimizedTargetedSubscribers[inMessage];
				if (optimized) {
					var optimizedSubscriber = optimized[inObject.getNotificationsIdentifer()];
					if (optimizedSubscriber) optimizedSubscriber(inMessage, inObject, inOptExtras);
					shouldNotifyGenericSubscribers = false;
				}
			} else {
				var targetedSubscribers = this.mTargetedSubscribers[inMessage];
				if (targetedSubscribers) {
					var targetedIdx, targetedSubscriber, callback;
					for (targetedIdx = 0; targetedIdx < targetedSubscribers.length; targetedIdx++) {
						targetedSubscriber = targetedSubscribers[targetedIdx];
						callback = targetedSubscriber[0], o = targetedSubscriber[1];
						if (o == inObject && callback) callback(inMessage, inObject, inOptExtras);
					}
					shouldNotifyGenericSubscribers = false;
				}
			}
		}
		// Notify any generic subscribers (if we need to)
		if (shouldNotifyGenericSubscribers) {
			var callbacks = this.mGenericSubscribers[inMessage], callbackIdx, callback;
			if (callbacks) {
				for (callbackIdx = 0; callbackIdx < callbacks.length; callbackIdx++) {
					callback = callbacks[callbackIdx];
					callback(inMessage, inObject, inOptExtras);
				}
			}
		}
		// Always signal the test tool where it exists.
		if (window.parent && window.parent.AppleUnitTester) {
			window.parent.AppleUnitTester.sharedTester().publishMessage(inMessage);
		}
		return true;
	},
	subscribe: function(inMessage, inCallback, inOptObject) {
		if (!inMessage || !inCallback) return false;
		// Is this subscription targeted?
		if (inOptObject != undefined) {
			if (inOptObject.mSupportsOptimizedNotifications) {
				if (!this.mOptimizedTargetedSubscribers[inMessage]) this.mOptimizedTargetedSubscribers[inMessage] = {};
				var notificationID = inOptObject.getNotificationsIdentifer();
				var targetedSubscribersForMessage = this.mOptimizedTargetedSubscribers[inMessage];
				targetedSubscribersForMessage[notificationID] = inCallback;
			} else {
				if (!this.mTargetedSubscribers[inMessage]) this.mTargetedSubscribers[inMessage] = new Array();
				this.mTargetedSubscribers[inMessage].push([inCallback, inOptObject]);
			}
		} else {
			if (!this.mGenericSubscribers[inMessage]) this.mGenericSubscribers[inMessage] = new Array();
			this.mGenericSubscribers[inMessage].push(inCallback);
		}
	},
	unsubscribe: function(inMessage, inCallback, inOptObject) {
		if (inOptObject) {
			if (inOptObject.mSupportsOptimizedNotifications) {
				var optimized = this.mOptimizedTargetedSubscribers[inMessage];
				if (optimized) return optimized.unset(inOptObject.getNotificationsIdentifer());
				return true;
			}
			var targeted = this.mTargetedSubscribers[inMessage]
			if (targeted) {
				this.mTargetedSubscribers = this.mTargetedSubscribers[inMessage].reject(function(subscriber) {
					return (subscriber[0] == inCallback && subscriber[1] == inOptObject);
				});
			}
		}
		if (!this.mGenericSubscribers[inMessage]) return false;
		this.mGenericSubscribers = this.mGenericSubscribers[inMessage].without(inCallback);
		return true;
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.Accessibility = CC.Accessibility || new Object();

// Tab index name constants.

/* Header menu items */
CC.Accessibility.TAB_INDEX_NAME_NAV_GENERAL 			= 'cc-tab-index-header-general';
CC.Accessibility.TAB_INDEX_NAME_NAV_EDIT 				= 'cc-tab-index-header-edit';
CC.Accessibility.TAB_INDEX_NAME_NAV_DOWNLOAD 			= 'cc-tab-index-header-download';
CC.Accessibility.TAB_INDEX_NAME_NAV_SCOREBOARD 			= 'cc-tab-index-header-scoreboard';
CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS 				= 'cc-tab-index-header-plus';
CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS_NEW_BOT		= 'cc-tab-index-header-plus-new-bot';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR 				= 'cc-tab-index-header-gear';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_MOVE 			= 'cc-tab-index-header-gear-move';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_APPROVE 		= 'cc-tab-index-header-gear-approve';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_DELETE 		= 'cc-tab-index-header-gear-delete';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HIDE 			= 'cc-tab-index-header-gear-hide';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_USER_SETTINGS 	= 'cc-tab-index-header-gear-user-settings';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_BOT_DELETE 	= 'cc-tab-index-header-gear-bot-delete';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_BOT_SETTINGS 	= 'cc-tab-index-header-gear-bot-settings';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_ABOUT 			= 'cc-tab-index-header-gear-about';
CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HELP 			= 'cc-tab-index-header-gear-help';
CC.Accessibility.TAB_INDEX_NAME_NAV_LOGIN 				= 'cc-tab-index-header-login';
CC.Accessibility.TAB_INDEX_NAME_NAV_LOGOUT 				= 'cc-tab-index-header-logout';
CC.Accessibility.TAB_INDEX_NAME_NAV_SEARCH 				= 'cc-tab-index-header-search';

/* Banner menu items */
CC.Accessibility.TAB_INDEX_NAME_BANNER_HOME 			= 'cc-tab-index-banner-home';
CC.Accessibility.TAB_INDEX_NAME_BANNER_ACTIVITY 		= 'cc-tab-index-banner-activity';
CC.Accessibility.TAB_INDEX_NAME_BANNER_DOCUMENTS 		= 'cc-tab-index-banner-documents';
CC.Accessibility.TAB_INDEX_NAME_BANNER_TAGS 			= 'cc-tab-index-banner-tags';
CC.Accessibility.TAB_INDEX_NAME_BANNER_CALENDAR 		= 'cc-tab-index-banner-calendar';
CC.Accessibility.TAB_INDEX_NAME_BANNER_BLOG 			= 'cc-tab-index-banner-blog';

/* Filter menu items */
CC.Accessibility.TAB_INDEX_NAME_FILTER_MAIN 			= 'cc-tab-index-filter-main';
CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY 			= 'cc-tab-index-filter-sort-by';
CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY_TYPE 	= 'cc-tab-index-filter-sort-by-type';
CC.Accessibility.TAB_INDEX_NAME_FILTER_KEYWORD 			= 'cc-tab-index-filter-keyword';
CC.Accessibility.TAB_INDEX_NAME_FILTER_SAVE 			= 'cc-tab-index-filter-save';
CC.Accessibility.TAB_INDEX_NAME_FILTER_DONE				= 'cc-tab-index-filter-done';

/* Sidebar menu items */
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS 						= 'cc-tab-index-sidebar-tags';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_TEXTBOX 				= 'cc-tab-index-sidebar-tags-textbox';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_COLLECTION 			= 'cc-tab-index-sidebar-tags-collection';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED 					= 'cc-tab-index-sidebar-related';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_SEARCH 				= 'cc-tab-index-sidebar-related-search';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_RECENT 				= 'cc-tab-index-sidebar-related-recent';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_COMMENTS 					= 'cc-tab-index-sidebar-comments';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_NOTIFICATIONS 				= 'cc-tab-index-sidebar-notifications';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY 					= 'cc-tab-index-sidebar-history';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_SHOWMORE			= 'cc-tab-index-sidebar-history-showmore';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_CLOSE 		= 'cc-tab-index-sidebar-history-action-close';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_RESTORE	 	= 'cc-tab-index-sidebar-history-action-restore';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_SHOWCHANGES 	= 'cc-tab-index-sidebar-history-action-showchanges';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_HIDECHANGES 	= 'cc-tab-index-sidebar-history-action-hidechanges';
CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_SHARING 					= 'cc-tab-index-sidebar-sharing';

/* Popup items - Settings */
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_GENERAL 					= 'cc-tab-index-popup-settings-general';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE 				= 'cc-tab-index-popup-settings-appearance';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE_PARAMS		= 'cc-tab-index-popup-settings-appearance-params';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS 				= 'cc-tab-index-popup-settings-permissions';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_NAME 		= 'cc-tab-index-popup-settings-permissions-name';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_ACCESS 		= 'cc-tab-index-popup-settings-permissions-access';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_COMMENTS		= 'cc-tab-index-popup-settings-permissions-comments';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_MODERATION	= 'cc-tab-index-popup-settings-permissions-moderation';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_SAVE				= 'cc-tab-index-popup-settings-button-save';
CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_CANCEL			= 'cc-tab-index-popup-settings-button-cancel';

/* Popup items - Dialog */
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_NEW_PAGE		 			= 'cc-tab-index-popup-new-page';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_DELETE_PAGE				= 'cc-tab-index-popup-move-delete-page';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_UPLOAD_FILE_TO_DOCUMENTS	= 'cc-tab-index-popup-upload-file-to-documents';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_SIMPLETEXT			= 'cc-tab-index-popup-move-simpletext';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_OK_BUTTON 					= 'cc-tab-index-popup-ok-button';
CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_CANCEL_BUTTON 				= 'cc-tab-index-popup-cancel-button';

/* Popup items - Dialog */
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_BOT_SETTINGS_TABS					= 'cc-tab-index-popup-create-bot-settings-tabs';
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_INFO_VIEW					= 'cc-tab-index-popup-create-new-bot-info-view';			// (Step 1/4)
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW				= 'cc-tab-index-popup-create-new-bot-schedule-view';		// (Step 2/4)
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_TESTING_VIEW				= 'cc-tab-index-popup-create-new-bot-testing-view';			// (Step 3/4)
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_NOTIFICATION_VIEW			= 'cc-tab-index-popup-create-new-bot-notification-view';	// (Step 4/4)
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_TESTING_VIEW_DEVICES		= 'cc-tab-index-popup-create-new-bot-testing-view-devices';
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW_SELECT_BOX	= 'cc-tab-index-popup-create-new-bot-schedule-view-select-box';
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_CANCEL				= 'cc-tab-index-popup-create-new-bot-button-cancel';
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_PREVIOUS 			= 'cc-tab-index-popup-create-new-bot-button-previous';
CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_NEXT 				= 'cc-tab-index-popup-create-new-bot-button-next';

/* List of items (Activities, Documents) */
CC.Accessibility.TAB_INDEX_NAME_LIST_ITEMS 	= 'cc-tab-index-list-items';

/* XCode - Bot List */ 
CC.Accessibility.TAB_INDEX_NAME_BOT_LIST 	= 'cc-tab-index-bot-list';

/* Bot Header View items */
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ENTITY_TITLE 					= 'cc-tab-index-bot-header-view-entity-title';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY 						= 'cc-tab-index-bot-header-view-summary';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_INFO 					= 'cc-tab-index-bot-header-view-summary-info';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS 				= 'cc-tab-index-bot-header-view-summary-results';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_ERRORS 			= 'cc-tab-index-bot-header-view-summary-results-errors';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_WARNINGS 		= 'cc-tab-index-bot-header-view-summary-results-warnings';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_ISSUES 			= 'cc-tab-index-bot-header-view-summary-results-issues';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_TESTS_SUMMARY 	= 'cc-tab-index-bot-header-view-summary-results-tests-summary';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_DOWNLOADS 				= 'cc-tab-index-bot-header-view-summary-downloads';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS 							= 'cc-tab-index-bot-header-view-tests';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_HEADER					= 'cc-tab-index-bot-header-view-tests-header';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_DETAILS					= 'cc-tab-index-bot-header-view-tests-details';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_DEVICE					= 'cc-tab-index-bot-header-view-tests-device';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_BOTTOM					= 'cc-tab-index-bot-header-view-tests-bottom';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_INFO 						= 'cc-tab-index-bot-header-view-tests-info';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS					= 'cc-tab-index-bot-header-view-tests-results';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TOTALS			= 'cc-tab-index-bot-header-view-tests-results-total';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TESTS_FAILED 		= 'cc-tab-index-bot-header-view-tests-results-tests-failed';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TESTS_PASSED 		= 'cc-tab-index-bot-header-view-tests-results-tests-passed';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_COMMITS 						= 'cc-tab-index-bot-header-view-commits';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_LOGS 							= 'cc-tab-index-bot-header-view-logs';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ARCHIVES 						= 'cc-tab-index-bot-header-view-archives';
CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_INTEGRATE						= 'cc-tab-index-bot-header-view-integrate';

CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP									= 'cc-tab-index-bot-summary-top';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_LAST_INTEGRATION				= 'cc-tab-index-bot-summary-top-last-integration';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_LAST_INTEGRATION_VIEW_SUMMARY 	= 'cc-tab-index-bot-summary-top-last-integration-view-summary';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_NEXT_INTEGRATION				= 'cc-tab-index-bot-summary-top-next-integration';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_NEXT_INTEGRATION_INTEGRATE_NOW	= 'cc-tab-index-bot-summary-top-next-integration-integrate-now';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS						= 'cc-tab-index-bot-summary-top-downloads';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS_VIEW_ARCHIVES			= 'cc-tab-index-bot-summary-top-downloads-view-archives';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS_ARCHIVE_LINK			= 'cc-tab-index-bot-summary-top-downloads-archive-link';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM								= 'cc-tab-index-bot-summary-bottom';
CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM_LIST 						= 'cc-tab-index-bot-summary-bottom-list';

CC.Accessibility.TAB_INDEX_NAME_MAP = {};
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GENERAL] = '10';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_EDIT] = '20';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_DOWNLOAD] = '30';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_SCOREBOARD] = '40';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS] = '50';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS_NEW_BOT] = '51';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR] = '60';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_MOVE] = '70';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_APPROVE] = '80';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_DELETE] = '90';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HIDE] = '100';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_WIKI_SETTINGS] = '110';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_REPLACE] = '120';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_USER_SETTINGS] = '130';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_BOT_DELETE] = '131';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_BOT_SETTINGS] = '132';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_ABOUT] = '140';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HELP] = '150';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_LOGIN] = '160';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_LOGOUT] = '170';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_NAV_SEARCH] = '180';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_HOME] = '200';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_ACTIVITY] = '210';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_DOCUMENTS] = '220';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_TAGS] = '230';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_CALENDAR] = '240';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BANNER_BLOG] = '250';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_MAIN] = '260';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY] = '270';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY_TYPE] = '280';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_KEYWORD] = '290';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_SAVE] = '291';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_FILTER_DONE] = '292';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS] = '300';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_TEXTBOX] = '310';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS_COLLECTION] = '320';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED] = '330';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_SEARCH] = '340';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_RELATED_RECENT] = '350';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_COMMENTS] = '360';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_NOTIFICATIONS] = '370';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY] = '380';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_SHOWMORE] = '390';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_CLOSE] = '501';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_RESTORE] = '502';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_SHOWCHANGES] = '503';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_HISTORY_ACTION_HIDECHANGES] = '504';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_SHARING] = '600';

// used for list of tags in the side bar
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_TAGS_COLLECTION] = '700';

// used for list of documents, activities, etc
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_LIST_ITEMS] = '1000'; 

/* Popups */
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_GENERAL] = '2000';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE] = '2100';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE_PARAMS] = '2101';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS] = '2200';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_NAME] ='2210';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_ACCESS] ='2220';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_COMMENTS] ='2230';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_PERMISSIONS_MODERATION] ='2240';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_SAVE] = '2301';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_BUTTON_CANCEL] = '2302';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_NEW_PAGE] = '2400'; 					// Popup: New Page in My Documents...
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_DELETE_PAGE] = '2410';					// Popup: Delet Page...
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_UPLOAD_FILE_TO_DOCUMENTS] = '2420'; 	// Popup: Upload File to My Documents...
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_TO_WIKI_NAME] = '2430'; 			// Popup: Move to Wiki...
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_TO_WIKI_RESULT] = '2440';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_SIMPLETEXT] = '2450';				// Popups: Log out, About, etc..
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_OK_BUTTON] = '2901'; 					// Popup Buttons: OK, CANCEL
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_CANCEL_BUTTON] = '2902';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_BOT_SETTINGS_TABS] = '2900';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_INFO_VIEW] = '2910';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW] = '2920';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW_SELECT_BOX] = '2921';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_TESTING_VIEW] = '2940';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_TESTING_VIEW_DEVICES] = '2945';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_NOTIFICATION_VIEW] = '2960';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_CANCEL] = '2970';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_PREVIOUS] = '2980';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_NEXT] = '2990';

// Used for traveling through list of bots on the left side bar
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_LIST] = '3000';

CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ENTITY_TITLE] = '3100';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY] = '3200';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_INFO] = '3210';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS] = '3220';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_ERRORS] = '3221';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_WARNINGS] = '3222';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_ISSUES] = '3223';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_TESTS_SUMMARY] = '3224';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_DOWNLOADS] = '3230';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS] = '3300';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_HEADER] = '3301';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_INFO] = '3310';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS] = '3320';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TOTAL] = '3321';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TESTS_FAILED] = '3322';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TESTS_PASSED] = '3323';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_DETAILS] = '3400';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_DEVICE] = '3410';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_BOTTOM] = '3500';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_COMMITS] = '3600';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_LOGS] = '3700';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ARCHIVES] = '3800';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_INTEGRATE] = '4100';

// Summary Bot View
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP] = '3211';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_LAST_INTEGRATION] = '3213';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_LAST_INTEGRATION_VIEW_SUMMARY] = '3214';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_NEXT_INTEGRATION] = '3225';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_NEXT_INTEGRATION_INTEGRATE_NOW] = '3226';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS] = '3231';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS_VIEW_ARCHIVES] = '3232';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS_ARCHIVE_LINK] = '3233';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM] = '4000';
CC.Accessibility.TAB_INDEX_NAME_MAP[CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM_LIST] = '4010';

CC.Accessibility.TabIndexerElements = [];
CC.Accessibility.TabIndexerElements_Panel = [];

CC.Accessibility.accessibility = Class.createWithSharedInstance('accessibility', true);

CC.Accessibility.accessibility.prototype = {
	initialize: function() {
		// Root views element for a basic dialog
		CC.Accessibility.TabIndexerElements.push('root');
		CC.Accessibility.TabIndexerElements.push('quicksearch');
		CC.Accessibility.TabIndexerElements.push('table_block_settings_dialog');
		CC.Accessibility.TabIndexerElements.push('dialog_mask');
		CC.Accessibility.TabIndexerElements.push('table_block_inline_popup');
		CC.Accessibility.TabIndexerElements.push('progress_message_dialog');
		CC.Accessibility.TabIndexerElements.push('search');
		
		// Root views element for a panel modal window
		CC.Accessibility.TabIndexerElements_Panel.push('header');
		CC.Accessibility.TabIndexerElements_Panel.push('main');
		CC.Accessibility.TabIndexerElements_Panel.push('dialog_mask');
		CC.Accessibility.TabIndexerElements_Panel.push('table_block_inline_popup');
		CC.Accessibility.TabIndexerElements_Panel.push('progress_message_dialog');
		CC.Accessibility.TabIndexerElements_Panel.push('search');
	},
	
	/* Return tabIndex for a given element name */
	requestTabIndex: function(inName) {
		return CC.Accessibility.TAB_INDEX_NAME_MAP[inName];
	},	
	/* Set aria-hidden attribute on root views located behind modal dialogs */
	setRootViewsAriaHidden: function(isHidden, isPanel) {
		if (!isPanel) {
			for (i=0; i < CC.Accessibility.TabIndexerElements.length; i++) {
				if ($(CC.Accessibility.TabIndexerElements[i]))
					$(CC.Accessibility.TabIndexerElements[i]).writeAttribute('aria-hidden', isHidden.toString());
			}			
		} else {
			for (i=0; i < CC.Accessibility.TabIndexerElements_Panel.length; i++) {
				if ($(CC.Accessibility.TabIndexerElements_Panel[i]))
					$(CC.Accessibility.TabIndexerElements_Panel[i]).writeAttribute('aria-hidden', isHidden.toString());
			}			
		}
	},
	/* Set aria-hidden attribute on root views (parent view) from an iframe */
	setRootViewsAriaHiddenFromIframe: function(isHidden) {
		for (i=0; i < CC.Accessibility.TabIndexerElements.length; i++) {
			if (window.parent.document.getElementById(CC.Accessibility.TabIndexerElements[i])) {
				window.parent.document.getElementById(CC.Accessibility.TabIndexerElements[i]).writeAttribute('aria-hidden', isHidden.toString());
			}			
		}
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



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
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.





CC.ActivityStream = CC.ActivityStream || new Object();

// Notifications.

CC.ActivityStream.NOTIFICATION_DID_GET_NEW_ACTIVITY_CHUNK = 'DID_GET_NEW_ACTIVITY_CHUNK';
CC.ActivityStream.NOTIFICATION_NO_STREAM_ACTIVITY = 'NO_STREAM_ACTIVITY';
CC.ActivityStream.NOTIFICATION_ACTIVITY_STREAM_SHOULD_RECONNECT = 'ACTIVITY_STREAM_SHOULD_RECONNECT';
CC.ActivityStream.IFRAME_NO_ACTIVITY_INTERVAL = 300000;

// Activity stream shared instance so the chunked response <script> tag has something to call.
// Publishes a notification when any new activity arrives. Private shared instance hard-coded
// on the server to prevent XSS.

var ActivityStreamSharedInstance = Class.createWithSharedInstance('activityStream');
ActivityStreamSharedInstance.prototype = {
	initialize: function() {},
	signalWithJSON: function(inScriptTag, inJSON) {
		globalNotificationCenter().publish(CC.ActivityStream.NOTIFICATION_DID_GET_NEW_ACTIVITY_CHUNK, this, {'json': inJSON});
		inScriptTag.parentNode.removeChild(inScriptTag);
	}
};

// Activity stream chunked frame class. Initialize one of these to get activity stream behavior.
// The chunked response will call the activityStream() shared instance, which publishes a notification
// and triggers a callback.

CC.ActivityStream.ChunkFrame = Class.create({
	mCallback: null,
	mURL: "/xcs/streams/activity?format=js",
	mFrame: null,
	mFrameReloadThreshold: 5000,
	mFrameReloadInterval: null,
	initialize: function(/* [options] */) {
		if (arguments && arguments.length > 0) Object.extend(this, arguments[0]);
		var frame = document.createElement('iFrame');
		frame.className = 'cc-activity-stream-chunk-frame';
		frame.style.display = 'none';
		document.body.appendChild(frame);
		this.mFrame = frame;
		this.setFrameURL(this.mURL);
		// Listen for notifications.
		globalNotificationCenter().subscribe(CC.ActivityStream.NOTIFICATION_DID_GET_NEW_ACTIVITY_CHUNK, this.handleChunkNotification.bind(this));
		globalNotificationCenter().subscribe(CC.ActivityStream.NOTIFICATION_ACTIVITY_STREAM_SHOULD_RECONNECT, this.reloadFrame.bind(this));
		
		Event.observe(frame, 'load', this.reloadFrame.bind(this));
		Event.observe(frame, 'error', this.reloadFrame.bind(this));
		
		this.setFrameNoActivityTimeout();
	},
	resetFrameNoActivityTimeout: function() {
		if (this.mFrameReloadInterval) {
			clearInterval(this.mFrameReloadInterval);
			this.setFrameNoActivityTimeout();
		}
	},
	setFrameNoActivityTimeout: function() {
		this.mFrameReloadInterval = setInterval(function() {
			logger().info("No stream activity notifications or heartbeat in a while. Reloading stream.");
			globalNotificationCenter().publish(CC.ActivityStream.NOTIFICATION_NO_STREAM_ACTIVITY);
			this.reloadFrame();
		}.bind(this), CC.ActivityStream.IFRAME_NO_ACTIVITY_INTERVAL);
	},
	reloadFrame: function() {
		if (event && event.type == "load") {
			logger().error("Activity frame appears to have fully loaded, will reload in %@ms".fmt(this.mFrameReloadThreshold));
		}
		if (event && event.type == "error") {
			logger().error("Activity frame appears to have encountered an error, will reload in %@ms".fmt(this.mFrameReloadThreshold));
		}
		
		if (this.mFrameReloadTimer) {
			clearTimeout(this.mFrameReloadTimer);
			this.mFrameReloadTimer = null;
		}
		this.mFrameReloadTimer = setTimeout(function() {
			this.setFrameURL(this.mURL);
		}.bind(this), this.mFrameReloadThreshold);
	},
	setFrameURL: function(inURL) {
		logger().debug("Reloading activity frame (url = %@)".fmt(inURL));
		if (this.mFrame) {
			this.mFrame.src = inURL;
		} else {
			logger().error("Activity frame not found, something is really wrong");
		}
	},
	handleChunkNotification: function(inMessage, inObject, inOptExtras) {
		this.resetFrameNoActivityTimeout();
		if (this.mCallback) return this.mCallback(inOptExtras && inOptExtras.json);
		logger().error("No chunk callback registered ... skipping");
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



var apple_loc_strings = apple_loc_strings || {};

CC.LocalizationManager = Class.createWithSharedInstance('globalLocalizationManager', false);
CC.LocalizationManager.prototype = {
	_strings: {},
	initialize: function() {
	    this.setStrings(apple_loc_strings);
	},
	setStrings: function(stringsHash) {
	    Object.extend(this._strings, stringsHash);
	},
	localize: function(key) {
		return this._strings[key] || key;
	},
	getLprojLocale: function() {
		var LANGUAGE_TO_LPROJ_MAP = {
		  'de': 'de',
		  'en': 'en',
		  'es': 'es',
		  'fr': 'fr',
		  'it': 'it',
		  'ja': 'ja',
		  'ko': 'ko',
		  'nl': 'nl',
		  'zh-cn': 'zh_CN',
		  'zh-tw': 'zh_TW'
		};
		var browserLocale = navigator.language || navigator.browserLanguage || 'en';
		var lProjLocale = LANGUAGE_TO_LPROJ_MAP[browserLocale];
		if (!lProjLocale) {
			// If we can't find an exact match on language AND region, try language alone.
			// For ex, browser can return zh-cn, but also fr-fr or ja-jp, and in the last 2 cases we need to match on fr and ja.
			lProjLocale = LANGUAGE_TO_LPROJ_MAP[browserLocale.split('-')[0]];
		}
		return lProjLocale || 'en';
	},
	localizedDay: function(inDate, inOptUseShortFormat) {
		var adjustedDate = this.adjustDateForUTCOffset(inDate);
		if (adjustedDate) {
			var day_index = adjustedDate.getDay();
			if (day_index < 7) {
				if (inOptUseShortFormat) {
					return "_Date.Short.Day.Names".loc().split(',')[day_index];
				} else {
					return "_Date.Day.Names".loc().split(',')[day_index];
				}
			}
		}
		return "_Date.Unknown".loc();
	},
	localizedDate: function(inDate, inOptUseShortFormat) {
		var adjustedDate = this.adjustDateForUTCOffset(inDate);
		if (adjustedDate) {
			var day_delta = this.calculateDayDeltaForDateFromToday(adjustedDate);
			if (day_delta == 0) {
				return "_Date.Today".loc();
			} else if (day_delta == -1) {
				return "_Date.Yesterday".loc();
			} else if (day_delta == 1) {
				return "_Date.Tomorrow".loc();
			} else {
				var month = adjustedDate.getMonth();
				var localizedMonth;
				if (inOptUseShortFormat) {
					localizedMonth = "_Date.Short.Month.Names".loc().split(',')[month % 12];
				} else {
					localizedMonth = "_Date.Month.Names".loc().split(',')[month % 12];
				}
				var day = adjustedDate.getDate();
				if (Math.abs(day_delta) <= 365) {
					return "_Date.Short.Format".loc(localizedMonth, day);
				} else {
					var year = adjustedDate.getFullYear();
					return "_Date.Long.Format".loc(localizedMonth, day, year);
				}
			}
		}
		return "_Date.Unknown".loc();
	},
	localizedDateWithTime: function(inDate, inOptUseShortFormat) {
		if (inDate) {
			return "_DateTime.Format".loc(this.localizedDate(inDate, inOptUseShortFormat), this.localizedTime(inDate));
		}
		return "_DateTime.Unknown".loc();
	},
	localizedTime: function(inDate) {
		var adjustedDate = this.adjustDateForUTCOffset(inDate);
		if (adjustedDate) {
			var hours = adjustedDate.getHours();
			var am = false;
			if (hours == 0) {
				hours = 12;
				am = true;
			} else if (hours < 12) {
				if (hours > 0) am = true;
			} else if (hours > 12) {
				hours -= 12;
			}
			var minutes = adjustedDate.getMinutes();
			if (minutes < 10) minutes = "0" + minutes;
			return "_Time.Default.Format".loc(hours, minutes, (am ? "_Time.AM".loc() : "_Time.PM".loc()));
		}
		return "_Time.Unknown".loc();
	},
	// Returns a "Today", "Yesterday", "XX at YY:ZZ PM" UTC-adjusted formatted date string.
	localizedDateTime: function(inDate) {
		if (inDate) {
			var adjustedDate = this.adjustDateForUTCOffset(inDate);
			if (adjustedDate) {
				var date = this.localizedDate(adjustedDate);
				var time = this.localizedTime(adjustedDate);
				return "_DateTime.Format".loc(date, time);
			}
		}
		return "_DateTime.Unknown".loc();
	},
	// Returns a "Day at YY:ZZ PM" date string.
	localizedDayAndTime: function(inDate) {
		if (inDate) {
			var adjustedDate = this.adjustDateForUTCOffset(inDate);
			if (adjustedDate) {
				var localizedDay = this.localizedDay(adjustedDate);
				var localizedTime = this.localizedTime(adjustedDate);
				return "_DateTime.Format".loc(localizedDay, localizedTime);
			}
		}
		return "_DateTime.Unknown".loc();
	},
	// Returns the time if the given date is today, otherwise a XX/YY/ZZZZ at AA:BB UTC-adjusted formatted date time string.
	shortLocalizedDateTime: function(inDate) {
		if (inDate) {
			var adjustedDate = this.adjustDateForUTCOffset(inDate);
			if (adjustedDate) {
				var day_delta = this.calculateDayDeltaForDateFromToday(adjustedDate);
				if (day_delta == 0) {
					return this.localizedTime(adjustedDate);
				} else {
					// Remember to increment the month value since they're zero-indexed.
					var localizedDate = "_Date.Default.Format".loc((adjustedDate.getMonth() + 1), adjustedDate.getDate(), adjustedDate.getFullYear());
					var localizedTime = this.localizedTime(adjustedDate);
					return "_DateTime.Format".loc(localizedDate, localizedTime);
				}
			}
		}
		return "_DateTime.Unknown".loc();
	},
	// Returns a "XX/YY/ZZZZ" date string.
	shortLocalizedDate: function(inDate) {
		if (inDate) {
			var adjustedDate = this.adjustDateForUTCOffset(inDate);
			if (adjustedDate) {
				// Remember to increment the month value since they're zero-indexed.
				return "_Date.Default.Format".loc((adjustedDate.getMonth() + 1), adjustedDate.getDate(), adjustedDate.getFullYear());
			}
		}
		return "_DateTime.Unknown".loc();
	},
	// Returns a "XX/YY/ZZZZ HH:MM AM" date time string.
	shortLocalizedDateAndTime: function(inDate) {
		if (inDate) {
			return "_DateTime.NoAt.Format".loc(this.shortLocalizedDate(inDate), this.localizedTime(inDate));
		}
		return "_DateTime.Unknown".loc();
	},
	// Returns a "Mon DD YYYY" date time string.
	shortLocalizedDateWithMonthAsString: function(inDate) {
		var adjustedDate = this.adjustDateForUTCOffset(inDate);
		if (adjustedDate) {
			var month = adjustedDate.getMonth();
			var localizedMonth = "_Date.Short.Month.Names".loc().split(',')[month % 12];
			var day = adjustedDate.getDate();
			var year = adjustedDate.getFullYear();
			return "_Date.Long.Format".loc(localizedMonth, day, year);
		}
		return "_Date.Unknown".loc();
	},
	// Returns a "Mon DD YYYY HH:MM AM" if torday, or "Mon DD YYYY" date time string.
	shortLocalizedDateWithMonthAsStringWithTodaysTime: function(inDate) {
		var adjustedDate = this.adjustDateForUTCOffset(inDate);		
		if (adjustedDate) {
			var day_delta = this.calculateDayDeltaForDateFromToday(adjustedDate);
			var month = adjustedDate.getMonth();
			var day = adjustedDate.getDate();
			var year = adjustedDate.getFullYear();
			var localizedMonth = "_Date.Short.Month.Names".loc().split(',')[month % 12];
			
			if (day_delta == 0) {
				var time = this.localizedTime(adjustedDate);
				return "_Date.Long.WithTime.Format".loc(localizedMonth, day, year,time);
			}
			else {
				return "_Date.Long.Format".loc(localizedMonth, day, year);
			}
		}
		return "_Date.Unknown".loc();
	},
	calculateDayDeltaForDateFromToday: function(inDate) {
		return this.calculateDayDeltaForDateFromDate(inDate, new Date());
	},
	calculateDayDeltaForDateFromDate: function(inDate, inSecondDate) {
		if (!inDate || !inSecondDate) return undefined;
		// Strip everything but the day/month/year from the supplied dates.
		var inSecondDateStripped = new Date(inSecondDate.getFullYear(), inSecondDate.getMonth(), inSecondDate.getDate());
		var inDateStripped = new Date(inDate.getFullYear(), inDate.getMonth(), inDate.getDate());
		// If the difference between the two dates is zero, the day delta is 0.
		var dateDifference = inSecondDateStripped.getTime() - inDateStripped.getTime();
		// If the difference is greater than zero, the supplied date is before the stripped today date.
		// Otherwise if the difference is less than zero, the supplied date is after the stripped today
		// date. We negate the result here so one full day in the past is returned as -1.
		if (dateDifference > 0) {
			return -1 * ((dateDifference / (1000 * 60 * 60)) / 24)
		} else if (dateDifference < 0) {
			return ((Math.abs(dateDifference) / (1000 * 60 * 60)) / 24)
		} else {
			return 0;
		}
	},
	adjustDateForUTCOffset: function(inDate) {
		if (!inDate) return undefined;
		var dt = new Date();
		var offset = dt.getTimezoneOffset();
		var gmt_offset = inDate.getTimezoneOffset();
		var minutes_delta = offset - gmt_offset;
		inDate.setMinutes(inDate.getMinutes() + minutes_delta);
		return inDate;
	},
	localizedFileSize: function(inBytes) {
		if (!inBytes) return inBytes;
		if (inBytes < 1024) {
			return Math.round(inBytes) + " Bytes";
		} else if (inBytes < 1048576) {
			return Math.round(((inBytes / 1024) * 100) / 100)  + " KB";
		} else if (inBytes < 1073741824) {
			return  Math.round(((inBytes / 1048576) * 100) / 100) + " MB";
		} else {
			return  Math.round(((inBytes / 1073741824) * 100) / 100) + " GB";
		}
	},
	localizedDuration: function(inStartDate, inEndDate) {
		if (!inStartDate || !inEndDate) return;
		var delta = Math.abs(inEndDate.getTime() - inStartDate.getTime());
		var dayDifference = Math.floor(delta / (1000 * 60 * 60 * 24));
		delta = (delta % (1000 * 60 * 60 * 24));
		
		if (dayDifference > 1) {
			return "_Duration.MoreThanADay".loc();
		}
		
		var hourDifference = Math.floor(delta / (1000 * 60 * 60));
		delta = (delta % (1000 * 60 * 60));
		
		var minuteDifference = Math.floor(delta / (1000 * 60));
		delta = (delta % (1000 * 60));
		
		var secondDifference = Math.floor(delta / 1000);
		
		if (hourDifference >= 1) {
			if (hourDifference == 1) {
				if (minuteDifference == 1) {
					return "_Duration.SingleHourSingleMinutes".loc();
				} else {
					return "_Duration.SingleHourMinutes".loc(minuteDifference);
				}
			} else {
				if (minuteDifference == 1) {
					return "_Duration.PluralHourSingleMinutes".loc(hourDifference);
				} else {
					return "_Duration.PluralHourMinutes".loc(hourDifference, minuteDifference);
				}
			}
		}
		if (minuteDifference <= 1) {
			return "_Duration.LessThanAMinute".loc();
		} else {
			return "_Duration.Minutes".loc(minuteDifference);
		}
	},
	// Returns something like "Just now", "5 min ago", or "In 2 hrs"
	localizedTimeShift: function(inDate) {
		if (!inDate) return;
		var delta = Date.now() - inDate.getTime();
		var future = (delta < 0);
		delta = Math.abs(delta);
		
		// if we're in the future, and have non-zero seconds, add a minute for more "natural" countdowns
		if (future && Math.floor((delta % (1000 * 60)) / 1000) > 0)
			delta += (1000 * 60);
		
		var dayDifference = Math.floor(delta / (1000 * 60 * 60 * 24));
		delta = (delta % (1000 * 60 * 60 * 24));
		
		if (dayDifference >= 1) {
			if (dayDifference == 1) {
				return (future) ? "_TimeDifference.InSingleDays".loc() : "_TimeDifference.SingleDaysAgo".loc();
			} else {
				return (future) ? "_TimeDifference.InPluralDays".loc(dayDifference) : "_TimeDifference.PluralDaysAgo".loc(dayDifference);
			}
		}
		
		var hourDifference = Math.floor(delta / (1000 * 60 * 60));
		delta = (delta % (1000 * 60 * 60));
		
		var minuteDifference = Math.floor(delta / (1000 * 60));
		delta = (delta % (1000 * 60));
		
		var secondDifference = Math.floor(delta / 1000);
		
		if (hourDifference >= 1) {
			if (hourDifference == 1) {
				return (future) ? "_TimeDifference.InSingleHours".loc() : "_TimeDifference.SingleHoursAgo".loc();
			} else {
				return (future) ? "_TimeDifference.InPluralHours".loc(hourDifference) : "_TimeDifference.PluralHoursAgo".loc(hourDifference);
			}
		}
		
		if (minuteDifference < 1) {
			return (future) ? "_TimeDifference.InSingleMinutes".loc() : "_TimeDifference.LessThanAMinuteAgo".loc();
		} else if (minuteDifference == 1) {
			return (future) ? "_TimeDifference.InSingleMinutes".loc() : "_TimeDifference.SingleMinutesAgo".loc();
		} else {
			return (future) ? "_TimeDifference.InPluralMinutes".loc(minuteDifference) : "_TimeDifference.PluralMinutesAgo".loc(minuteDifference);
		}
	}
};

// Localizes a string.

String.prototype.loc = function() {
	var str = globalLocalizationManager().localize(this);
	return str.fmt.apply(str, arguments);
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.




// Does the browser support localStorage?
function browserSupportsLocalStorage() {
	try {
		return (('localStorage' in window) && window['localStorage'] != null);
	} catch (e) {
		return false;
	}
}


// Does the browser support addEventListener?

function browserSupportsAddEventListener() {
	try {
		return (('addEventListener' in window) && window['addEventListener'] != null);
	} catch (e) {
		return false;
	}
}

function browserSupportsModifyBodyClassName() {
	try {
		return (document && document.body && ('addClassName' in document.body) && document.body['addClassName'] != null);
	} catch (e) {
		return false;
	}
}

function browserSupportsJSON() {
	try {
		return (JSON !== undefined);
	} catch (e) {
		return false;
	}
}

CC.Browser = Class.createWithSharedInstance('browser');
CC.Browser.prototype = {
	initialize: function() {
		this.addBrowserVersionToBodyTag();
	},
	addBrowserVersionToBodyTag: function(name) {
		var matches;
		if (this.isiOS5Plus()) {
			this.addClassName('ios5plus');
		}
		if (this.isiOS6Plus()) {
			this.addClassName('ios6plus');
		}
		if (this.isiPhone()) {
			this.addClassName('iphone');
			return true;
		} else if (this.isiPod()) {
			this.addClassName('ipod');
			return true;
		} else if (this.isiPad()) {
			this.addClassName('ipad');
			return true;
		} else if (this.isSafari5Plus()) {
			this.addClassName('safari5plus');
			return true;
		} else if (matches = navigator.userAgent.match(/(Chrome|Firefox)\/([\d]+)/)) {
			if (matches && matches[1] != null && matches[2] != null) {
				var application = matches[1];
				var version = parseFloat(matches[2]);
				if (application == "Chrome" && version >= 11) {
					this.addClassName('chrome11plus');
					return true;
				} else if (application == "Firefox" && version >= 4) {
					this.addClassName('firefox4plus');
					return true;
				}
			}
		} else if (matches = navigator.userAgent.match(/MSIE ([\d]+)/)) {
			if (matches && matches[1] != null) {
				if (parseFloat(matches[1]) >= 9) {
					this.addClassName('ie9plus');
					return true;
				} else if (tridentMatches = navigator.userAgent.match(/Trident\/([\d]+)/)) {
					if (tridentMatches && tridentMatches[1] != null) {
						if (parseFloat(tridentMatches[1]) >= 5) {
							this.addClassName('ie9plus');
							return true;
						}
					}
				}
			}
		} else if (matches = navigator.userAgent.match(/Mozilla\/5.0 \(Windows NT/)) {
			if (matches && matches[0] != null) {
				this.addClassName('ie9plus');
				return true;
			}
		}
		this.addClassName('unsupported_browser');
		alert("_UnsupportedBrowser.Warning".loc());
		return false;
	},
	locale: function() {
		return (navigator.language ? navigator.language : navigator.browserLanguage || 'en').split('-')[0];
	},
	isIE: function() {
		return document.all && /MSIE/.test(navigator.userAgent);
	},
	isIE6: function() {
		return document.all && /MSIE 6/.test(navigator.userAgent);
	},
	isIE7: function() {
		return document.all && /MSIE 7/.test(navigator.userAgent);
	},
	isIE8: function() {
		return document.all && /MSIE 8/.test(navigator.userAgent);
	},
	isIE9: function() {
		return document.all && /MSIE 9/.test(navigator.userAgent);
	},
	isWebKit: function() {
		return /WebKit/.test(navigator.userAgent);
	},
	isSafari: function() {
		return /AppleWebKit\/.+Version/.test(navigator.userAgent);
	},
	isSafari4: function() {
		return /AppleWebKit\/.+Version\/4/.test(navigator.userAgent);
	},
	isSafari5: function() {
		return /AppleWebKit\/.+Version\/5/.test(navigator.userAgent);
	},
	isSafari6: function() {
		return /AppleWebKit\/.+Version\/6/.test(navigator.userAgent);
	},
	isSafari5Plus: function() {
		var matches = navigator.userAgent.match(/AppleWebKit\/.+Version\/([\d]+)/);
		if (matches && matches[1] != null) {
			if (parseFloat(matches[1]) >= 5) {
				return true
			}
		}
		return false;
	},
	isMobile: function() {
		return /Mobile/.test(navigator.userAgent);
	},
	isMobileSafari: function() {
		return / AppleWebKit\/.+Mobile\//.test(navigator.userAgent);
	},
	isiPad: function() {
		return this.isMobileSafari() && /iPad/.test(navigator.userAgent);
	},
	isiPhone: function() {
		return this.isMobileSafari() && /iPhone/.test(navigator.userAgent);
	},
	isiPod: function() {
		return this.isMobileSafari() && /iPod/.test(navigator.userAgent);
	},
	isiOS4Plus: function() {
		var matches = navigator.userAgent.match(/(iPhone|iPod|iPad|iPod touch); (U; )?(CPU|CPU [\w]*)? OS (\d)/);
		if (matches && matches.length > 0) {
			var version = parseFloat(matches[4]);
			if (version >= 4) {
				return true;
			}
		}
		return false;
	},
	isiOS5Plus: function() {
		var matches = navigator.userAgent.match(/(iPhone|iPod|iPad|iPod touch); (U; )?(CPU|CPU [\w]*)? OS (\d)/);
		if (matches && matches.length > 0) {
			var version = parseFloat(matches[4]);
			if (version >= 5) {
				return true;
			}
		}
		return false;
	},
	isiOS6Plus: function() {
		var matches = navigator.userAgent.match(/(iPhone|iPod|iPad|iPod touch); (U; )?(CPU|CPU [\w]*)? OS (\d)/);
		if (matches && matches.length > 0) {
			var version = parseFloat(matches[4]);
			if (version >= 6) {
				return true;
			}
		}
		return false;
	},
	isChrome: function() {
		return /Chrome/.test(navigator.userAgent);
	},
	isGecko: function() {
		return /Gecko\/\d*/.test(navigator.userAgent);
	},
	isFirefox: function() {
		return this.isGecko();
	},
	isCamino: function() {
		return /Gecko\/\d*.+Camino\/\d*/.test(navigator.userAgent);
	},
	isOpera: function() {
		return /Opera/.test(navigator.userAgent);
	},
	isMacintosh: function() {
		return /Macintosh/.test(navigator.userAgent);
	},
	isWindows: function() {
		return /Windows/.test(navigator.userAgent);
	},
	isLinux: function() {
		return /X11/.test(navigator.userAgent);
	},
	addClassName: function(inClassName) {
		if (browserSupportsModifyBodyClassName()) {
			document.body.addClassName(inClassName);
		}
	}
};

browser();
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



// Prompt if cookies are disabled.

if (!navigator.cookieEnabled) {
	alert("_Cookies.NoCookiesUnsupported".loc());
}

// Global cookie accessor shared instance.

CC.CookieManager = Class.createWithSharedInstance('globalCookieManager', false);
CC.CookieManager.prototype = {
	initialize: function() {},
	// Writes a new key/value pair to the browser cookie. Accepts a cookie
	// name, value, and optional path, expiry and secure preferences.
	setCookie: function(inCookieKey, inCookieValue, inOptCookiePath, inOptCookieExpiry, inOptIsSecure) {
		if (!inCookieKey) return false;
		this.destroyCookie(inCookieKey, inOptCookiePath);
		var expire = inOptCookieExpiry;
		if (!expire) {
			var today = new Date();
			expire = new Date();
			expire.setTime(today.getTime() + 1000 * 60 * 60);
		}
		var cookieValue = (inCookieValue == undefined ? '' : inCookieValue);
		var cookie = inCookieKey + '=' + cookieValue + '; path=' + (inOptCookiePath || '/') + '; expires=' + expire.toGMTString() + ';' + (inOptIsSecure ? ' secure;' : '');
		document.cookie = cookie;
		return true;
	},
	// Returns the value of a supplied cookie key.
	getCookie: function(inCookieKey) {
		if (!inCookieKey) return undefined;
		var pattern = new RegExp(inCookieKey + '=([^;]+)');
		var value = document.cookie.match(pattern);
		if (value && value.length > 1) {
			return value[1];
		}
		return undefined;
	},
	// Destoys a cookie entry for a given key and optional path.
	destroyCookie: function(inCookieKey, inOptPath) {
		if (!inCookieKey) return;
		document.cookie = inCookieKey + '=; path=' + (inOptPath || '/') + '; expires=Thu, 01-Jan-1970 00:00:01 GMT;';
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

function createDateObjFromISO8601(inISOString, inOptIsGMT) {
	if (!inISOString) return null;
	var str = inISOString.match(/[Tt]/) ? inISOString : inISOString+'T000000Z';
	var d = str.match(/(\d{4})-?(\d{2})-?(\d{2})\s*[Tt]?(\d{2}):?(\d{2}):?(\d{2})/);
	if (!d) return null; // bail if the format doesn't match
	var dt = new Date(d[1], d[2]-1, d[3], d[4], d[5], d[6]);
	if (inOptIsGMT) dt.setHours(dt.getHours()-(dt.getTimezoneOffset() / 60));
	return dt;
}

// Copied from calendar_widget_core
function padNumberStr(theNumber, digits) {
	var padder = ((arguments.length > 2) ? arguments[2] : '0');
	var theString = "";
	theString += theNumber;
	
	for (var i = 0; i < (digits-theString.length); i++) {
		theString = padder + theString;
	}
	
	return theString;
}

function dateObjToISO8601(inDateObj, inOptMakeGMT, inIncludeZ) {
	if (!inDateObj) return null;
	var includeZ = (arguments.length > 2 ? inIncludeZ : true);
	var dt = new Date(inDateObj.getTime()); // copy the incoming date
	if (inOptMakeGMT) dt.setHours(dt.getHours()-(dt.getTimezoneOffset() / (-60)));
	var iso_string = '';
	iso_string += dt.getFullYear()
				+ padNumberStr(dt.getMonth()+1, 2)
				+ padNumberStr(dt.getDate(), 2)
				+ 'T'
				+ padNumberStr(dt.getHours(), 2)
				+ padNumberStr(dt.getMinutes(), 2)
				+ padNumberStr(dt.getSeconds(), 2)
				+ (includeZ ? 'Z' : '');
	return iso_string;
}

function getEndDateUsingDuration(inDate, inDuration) {
	var dt = new Date(inDate.getTime());
	if (inDuration.days) dt.setDate(dt.getDate() + inDuration.days);
	if (inDuration.hours) dt.setHours(dt.getHours() + inDuration.hours);
	if (inDuration.minutes) dt.setMinutes(dt.getMinutes() + inDuration.minutes);
	if (inDuration.seconds) dt.setMinutes(dt.getSeconds() + inDuration.seconds);
	return dt;
}

function getDurationUsingEndDate(inStartDate, inEndDate) {
	var time = Math.floor((inEndDate.getTime() - inStartDate.getTime()) / 1000);
	var whole = (time < 0 ? Math.ceil : Math.floor);
	var duration = {days:whole(time / 86400)};
	time = time % 86400;
	duration.hours = whole(time / 3600);
	time = time % 3600;
	duration.minutes = whole(time / 60);
	duration.seconds = time % 60;
	return duration;
}

function durationFromISO8601(inISOString) {
	if (!inISOString) return null; // bail if we're not being handed a string
	var dt = inISOString.match(/^P([^T]*)T?(.*)$/);
	if (!dt) return null; // bail if string isn't a valid format
	var duration = new Object();
	['years', 'months', 'days', 'hours', 'minutes', 'seconds'].each(function(key, i) {
		var mat = dt[Math.floor(i/3)+1].match("([0-9]+)"+key.charAt(0).toUpperCase());
		duration[key] = mat ? parseInt(mat[1]) : 0;
	});
	return duration;
}

function durationToISO8601(inDuration) {
	var str = 'P';
	if (inDuration.years && inDuration.years > 0) str += inDuration.years+'Y';
	if (inDuration.months && inDuration.months > 0) str += inDuration.months+'M';
	if (inDuration.days && inDuration.days > 0) str += inDuration.days+'D';
	str += 'T';
	if (inDuration.hours && inDuration.hours > 0) str += inDuration.hours+'H';
	if (inDuration.minutes && inDuration.minutes > 0) str += inDuration.minutes+'M';
	if (inDuration.seconds && inDuration.seconds > 0) str += inDuration.seconds+'S';
	return str;
}

function getLocalizedHourKey(inHours, inOptMinutes) {
	var dt = new Date();
	dt.setHours(inHours);
	dt.setMinutes(inOptMinutes||0);
	var formatString = (inOptMinutes && inOptMinutes > 0 ? '_Dates.DateFormats.HourAndMinutes' : '_Dates.DateFormats.Hour');
	return dt.formatDate(formatString.loc());
}

function getTimeRangeDisplayString(inStartDate, inDuration) {
	if (inDuration.days > 0 && inDuration.hours == 0 && inDuration.minutes == 0) {
		var str = inStartDate.formatDate('_Dates.DateFormats.MediumDate'.loc());
		if (inDuration.days > 1) {
			var endDate = getEndDateUsingDuration(inStartDate, inDuration);
			endDate.setDate(endDate.getDate()-1);
			str += ' - ' + endDate.formatDate('_Dates.DateFormats.MediumDate'.loc());
		}
		return str;
	}
	var time_string = getLocalizedHourKey(inStartDate.getHours(), inStartDate.getMinutes());
	var endDate = getEndDateUsingDuration(inStartDate, inDuration);
	return inStartDate.formatDate('_Dates.DateFormats.MediumDate'.loc()) + '; ' + time_string + ' - ' + getLocalizedHourKey(endDate.getHours(), endDate.getMinutes());
}
;
// Copyright (c) 2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

/*
    dispatch.js
    A minimal kind of "GCD Lite" for use in the CalDAV library.
    
    This library does not provide actual concurrency, but it does allow you
    to serialize operations on a queue. This is used in CalDAV to simulate "pseudo-background"
    tasks. For example, when creating an event store for the current principal, the lookup
    request for the current principal is dispatched to a background queue. This allows the
    event store object to be returned immediately in a "not fully initialized" state,
    letting object methods that need full state to be delayed until everything is
    ready to run.
    
    Every attempt has been made to mimic the existing GCD API, though some
    functions have been modified to more appropriately suit JavaScript use cases.
    
    SPECIAL NOTE: if you perform an *actually* asynchronous operation inside a
    block (e.g., an Ajax call), you must dispatch_suspend before beginning the call,
    and dispatch_resume in the event handler to get the desired serial-blocking behavior.
*/

/* Class implementations */

function DispatchManager() {
    this.executionStack = [];
    this.usePostMessage = (window.postMessage != null);
	this.pauseDelay = -1;
	this.pauseHandler = null;
    
    if (this.usePostMessage) {
        this.pendingMessages = [];
        
        var self = this;
		if (browserSupportsAddEventListener()) {
	        window.addEventListener('message', function(e) {
	            if (e.source == window && e.data == '__dispatch') {
	                e.stopPropagation();
                
	                while (self.pendingMessages.length > 0) {
	                    var fn = self.pendingMessages.shift();
	                    if (fn[1] != null)
	                        fn[0].call(fn[1]);
	                    else
	                        fn[0]();
	                }
	            }
	        }, false);
		}
    }
}

DispatchManager.prototype.nextTick = function(callback, optContext) {
    if (this.usePostMessage) {
        this.pendingMessages.push([callback, optContext]);
        window.postMessage('__dispatch', '*');
    } else {
        if (optContext != null) {
            setTimeout(function() {
                callback.call(optContext);
            }, 0);
        } else {
            setTimeout(callback, 0);
        }
    }
};

DispatchManager.prototype.beginExecution = function(queue) {
    this.executionStack.push(queue);
};

DispatchManager.prototype.endExecution = function() {
    this.executionStack.pop();
};

DispatchManager.prototype.enablePauseDetection = function(callback, delay) {
	this.pauseHandler = callback;
	this.pauseDelay = delay;
};

DispatchManager.prototype.disablePauseDetection = function() {
	this.pauseHandler = null;
	this.pauseDelay = -1;
};

var __dispatch_manager = new DispatchManager();

function DispatchQueue(label) {
    this.label = label;
    this.tasks = [];
    this.executing = false;
    this.suspendCount = 0;
	this.pauseTimeout = null;
}

DispatchQueue.prototype.dispatch = function(callback) {
    // add this to the end of the queue
    this.tasks.push(callback);
    if (!this.executing)
        __dispatch_manager.nextTick(this.execute, this);
};

DispatchQueue.prototype.dispatchNext = function(callback) {
    // add this to the front of the queue
    this.tasks.unshift(callback);
    if (!this.executing)
        __dispatch_manager.nextTick(this.execute, this);
};

DispatchQueue.prototype.execute = function() {
    if (this.suspendCount > 0)
        return;
    
    this.executing = true;
    __dispatch_manager.beginExecution(this);
    
    while (this.tasks.length > 0) {
        this.tasks.shift()();
        if (this.suspendCount > 0)
            break;
    }
    
    __dispatch_manager.endExecution();
    this.executing = false;
};

DispatchQueue.prototype.suspend = function() {
    if (this.suspendCount++ == 0 && __dispatch_manager.pauseHandler !== null) {
		var queue = this;
    	this.pauseTimeout = setTimeout(function(){
    		if (__dispatch_manager.pauseHandler !== null)
				__dispatch_manager.pauseHandler.call(queue, queue);
    	}, __dispatch_manager.pauseDelay);
	}
};

DispatchQueue.prototype.resume = function() {
    if (--this.suspendCount <= 0) {
        this.suspendCount = 0;
        if (!this.executing)
            __dispatch_manager.nextTick(this.execute, this);
		
		if (this.pauseTimeout !== null) {
			clearTimeout(this.pauseTimeout);
			this.pauseTimeout = null;
		}
    }
};

/* Creating and Managing Queues */
function dispatch_queue_create(label) {
    return new DispatchQueue(label);
}

function dispatch_get_current_queue() {
    if (__dispatch_manager.executionStack.length == 0)
        return null;
    
    return __dispatch_manager.executionStack[__dispatch_manager.executionStack.length - 1];
}

function dispatch_queue_get_label(queue) {
    return queue.label;
}

/* Queuing Tasks for Dispatch */
function dispatch_async(queue, callback) {
    queue.dispatch(callback);
}

// Note: we can't wait() because JavaScript is single-threaded; this just does async
function dispatch_sync(queue, callback) {
    if (console && console.warn)
        console.warn('dispatch_sync is unavailable, performing dispatch_async instead');
    
    dispatch_async(queue, callback);
}

function dispatch_after(delay, queue, callback) {
    setTimeout(function() {
        queue.dispatchNext(callback);
    }, delay);
}

// This takes an optional continuation block to be called when all iterations are done
function dispatch_apply(iterations, queue, callback, continuation) {
    dispatch_async(queue, function() {
        for (var i = 0; i < iterations; i++)
            callback(i);
        
        if (typeof(continuation) === 'function')
            __dispatch_manager.nextTick(continuation);
    });
}

/* Suspending and resuming */
function dispatch_suspend(queue) {
    queue.suspend();
}

function dispatch_resume(queue) {
    queue.resume();
}

/* Debugging */
function dispatch_enable_pause_detection(callback, delay) {
	__dispatch_manager.enablePauseDetection(callback, delay);
}

function dispatch_disable_pause_detection() {
	__dispatch_manager.disablePauseDetection();
}
;
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.


// Removes every child node from a given parent.
function removeAllChildNodes(inParent) {
	inParent = $(inParent);
	while (inParent.childNodes.length > 0) {
		inParent.removeChild(inParent.firstChild);
	}
}

// Replaces the contents of an element with a string or another element. Passing inEvaluate
// as true raises the safety flag for using innerHTML for the replacement.
function replaceElementContents(inElement, inStringOrObj, inEvaluate) {
	var elm = $(inElement);
	if (typeof inStringOrObj == 'string' && inEvaluate) {
		elm.innerHTML = inStringOrObj;
	}
	else {
		removeAllChildNodes(elm);
		if (typeof inStringOrObj == 'string') {
			elm.appendChild(elm.ownerDocument.createTextNode(inStringOrObj));
		} else if (inStringOrObj) {
			elm.appendChild(inStringOrObj);
		}
	}
}

function insertAtBeginning(inElement, inParentElement) {
	var elm = $(inParentElement);
	if (!elm) return false;
	if (elm.childNodes.length > 0) elm.insertBefore($(inElement), elm.firstChild);
	else elm.appendChild($(inElement));
}

function insertAfter(inElement, inSibling) {
	var elm = $(inElement);
	var sibling = $(inSibling);
	var nextSibling = sibling.nextSibling;
	if (nextSibling) nextSibling.parentNode.insertBefore(elm, nextSibling);
	else sibling.parentNode.appendChild(inElement);
}

function insertBefore(inElement, inReferenceElement) {
	var elm = $(inElement);
	var ref = $(inReferenceElement);
	ref.parentNode.insertBefore(elm, ref);
}

// Moves all children of an element before the parent, and removes the unwanted parent.
function promoteElementChildren(inParent) {
	var fragment = document.createDocumentFragment(), currentChild;
	while (inParent && inParent.hasChildNodes()) {
		currentChild = inParent.firstChild;
		inParent.removeChild(currentChild);
		fragment.appendChild(currentChild);
	}
	inParent.parentNode.insertBefore(fragment, inParent);
	inParent.parentNode.removeChild(inParent);
}

function boundsForDiv(theDiv) {
	return offsetBoundsForDiv(theDiv); // IE can't handle fixed positioning so we can't depend on this
}

function offsetBoundsForDiv(theDiv) {
	return new Array(Element.getLeft(theDiv), Element.getTop(theDiv), theDiv.offsetWidth, theDiv.offsetHeight);
}

function blur() {
	try {
		var anchors = $A(d.getElementsByTagName('a'));
		if(anchors.length){
			var firstLink = anchors.detect(function(elm) {return elm.href});
			firstLink.focus();
			firstLink.blur();
		}
	}
	catch(e) {}
}
;
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.





var prototypeEventObserve = Event.observe;
Event.observe = function(elem, strEvent, callback) {
	var isMobile = /Mobile/.test(navigator.userAgent);
	if (strEvent == 'click' && isMobile) {
		strEvent = 'touchstart';
	}
	prototypeEventObserve(elem, strEvent, callback);
}

var GlobalEventDelegate = Class.createWithSharedInstance('globalEventDelegate');
GlobalEventDelegate.prototype = {
	mEventResponderRegistry: null,
	mRegisteredHandlersCache: null,
	initialize: function() {
		bindEventListeners(this, ['handleEventFired']);
		this.mEventResponderRegistry = new Hash();
		this.mRegisteredHandlersCache = {};
	},
	// Registers a DOM-responder for a given event by identifer. When an event fires that is
	// recieved by the global event delegate, we determine the closest element to the
	// event source matching an event responder, and delegate to that responder.
	registerDomResponderForEventByIdentifer: function(inEventName, inIdentifer, inCallback) {
		if (!inEventName) return false;
		if (inEventName == "click" && browser().isMobile()) {
			inEventName = "touchstart";
		}
		
		logger().debug("registerDomResponderForEventByIdentifer: %o %o", inEventName, inIdentifer);
		var responders = this.mEventResponderRegistry.get(inEventName);
		if (!responders) responders = this.mEventResponderRegistry.set(inEventName, new Hash());
		responders.set(inIdentifer, inCallback);
		this._registerEventHandlerForResponder(inEventName);
		return true;
	},
	bulkRegisterDomResponderForEventByIdentifer: function(inBatch) {
		if (!inBatch) return false;
		var batchItem;
		for (var batchIdx = 0; batchIdx < inBatch.length; batchIdx++) {
			batchItem = inBatch[batchIdx];
			this.registerDomResponderForEventByIdentifer(batchItem[0], batchItem[1], batchItem[2]);
		}
	},
	_registerEventHandlerForResponder: function(inEventName) {
		// Strictly one event handler per customer for performance.
		if (!this.mRegisteredHandlersCache[inEventName]) {
			Event.observe(window, inEventName, this.handleEventFired);
		}
	},
	// Unregisters a previously registered responder for an event name by identifer.
	unregisterDomResponderForEventByIdentifer: function(inEventName, inIdentifer) {
		if (!inEventName || !inIdentifer) return false;
		var eventResponders = this.mEventResponderRegistry.get(inEventName);
		if (!eventResponders || !eventResponders.get(inIdentifer)) return false;
		delete eventResponders[inIdentifer];
		this.mEventResponderRegistry.set(inEventName, eventResponders);
		return true;
	},
	// Unregisters all responders for a given event name.
	unregisterDomRespondersForEvent: function(inEventName) {
		if (!inEventName) return false;
		this.mEventResponderRegistry.unset(inEventName);
		return true;
	},
	// Handles an event, delegating to a registered DOM responder where possible. 
	handleEventFired: function(inEvent) {
		var type, responders, eventElement, nearesetResponder, nearestResponderId, nearestResponderCallback;
		// Do we have any responders for this event type?
		type = inEvent.type;
		responders = this.mEventResponderRegistry.get(type);
		if (responders) {
			eventElement = Event.element(inEvent);
			// Find the nearest responder in the document. For performance, check if the direct event
			// source element is a responder for this event. Otherwise walk up the direct ancestors tree.
			var workingNode = eventElement, workingNodeId;
			while (workingNode) {
				workingNodeId = (workingNode.id || (workingNode.readAttribute && workingNode.readAttribute('data-responder-id')));
				if (workingNodeId && responders.get(workingNodeId)) {
					nearestResponder = workingNode;
					nearestResponderId = workingNodeId;
					break;
				}
				workingNode = workingNode.parentNode;
			}
			if (nearestResponderId) {
				responderCallback = responders.get(nearestResponderId);
				// Trigger the callback for the nearest responder.
				if (responderCallback) {
					logger().debug("Delegating event %o to nearest responder %o %o", type, nearestResponderId, nearestResponder);
					return responderCallback(inEvent);
				}
			}
		}
		return false;
	},
	// Debug only. Simulates an event.
	simulateEvent: function(inEventName, inIdentifer) {
		if (!inEventName || !inIdentifer) return false;
		logger().debug("simulateEvent: %o, %o", inEventName, inIdentifer);
		Event.fire($(inIdentifer), inEventName);
	}
};

// Binds a series of event handlers to a given source.
function bindEventListeners(inParentObject, inFunctionArray) {
	if (!inParentObject || !inFunctionArray) return this;
	inFunctionArray.each(function(f) {
		inParentObject[f] = inParentObject[f].bindAsEventListener(inParentObject);
	});
}

function observeEvents(inParentObj, inElement, inFnNameArray, inOptStopObserving) {
	var elm = $(inElement);
	$H(inFnNameArray).each(function(handler) {
		if (inOptStopObserving) Event.stopObserving(elm, handler.key, inParentObj[handler.value]);
		else Event.observe(elm, handler.key, inParentObj[handler.value]);
	});
}

function stopObservingEvents(inParentObj, inElement, inFnNameArray) {
	observeEvents(inParentObj, inElement, inFnNameArray, true);
}

function isCommandClickEvent(inEvent) {
	if (browser().isMacintosh()) {
		if (inEvent && inEvent.metaKey) {
			return true;
		}
	}
	else {
		if (inEvent && inEvent.ctrlKey) {
			return true;
		}
	}
	
	if (inEvent && inEvent.which == 2){
		return true;
	}
	
	return false;
}
;
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Zero-pads a given number up to a supplied length (defaults to 3) and
// returns the result as a string, e.g. pad(13, 3) = "013". Handy for
// building random guids in fixture data.

var pad = function(x, length) {
	var val = "" + x;
	while (val.length < (length || 3)) {
		val = "0" + val;
	}
	return val;
}

// Builds a 36-character alphanumeric guid.

CC.GuidBuilder = Class.create({
	initialize: function() {
		var olderDate = new Date(1582, 10, 15, 0, 0, 0, 0);
		var now = new Date();
		var msec = now.valueOf() - olderDate.valueOf();
		var nic = pad(hex_hmac_md5(this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 16), location.href), 12).substring(0, 12);
		var uidArray = [
			this.getShiftedBits(msec, 0, 8),
			this.getShiftedBits(msec, 8, 12),
			this.getShiftedBits(msec, 12, 16),
			this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 2) + this.getShiftedBits(this.getRandomNumberInRange(0, 4095), 0, 2),
			nic
		];
		this.mStringValue = uidArray.join('-');
	},
	getRandomNumberInRange: function(inMin, inMax) {
		return Math.min(Math.max(Math.round((Math.random() * (inMin + inMax)) - inMin), inMin), inMax);
	},
	getShiftedBits: function(inValue, inStart, inEnd) {
		var base16str = pad(inValue.toString(16), inEnd);
		return base16str.substring(inStart, inEnd);
	},
	toString: function() {
		return this.mStringValue;
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.HiDPI = Class.createWithSharedInstance('hidpi', true);
CC.HiDPI.prototype = {
	initialize: function() {
		this.setDPIClassName();
	},
	isHiDPI: function() {
		if (!('devicePixelRatio' in window)) return false;
		if (('devicePixelRatio' in window) && window['devicePixelRatio'] == undefined) return false;
		return (window.devicePixelRatio >= 2);
	},
	setDPIClassName: function() {
		if (this.isHiDPI()) {
			document.body.addClassName('hidpi');
		} else {
			document.body.removeClassName('hidpi');
		}
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.Keyboard = CC.Keyboard || new Object();
CC.Keyboard.Mixins = CC.Keyboard.Mixins || new Object();

// A keyboard shortcut delegate.

CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RETURN = 'DID_KEYBOARD_RETURN';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_TAB = 'DID_KEYBOARD_TAB';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_TAB = 'DID_KEYBOARD_SHIFT_TAB';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC = 'DID_KEYBOARD_ESC';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_ESC = 'DID_KEYBOARD_SHIFT_ESC'
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SPACE = 'DID_KEYBOARD_SPACE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_BACKSPACE = 'DID_KEYBOARD_BACKSPACE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DELETE = 'DID_KEYBOARD_DELETE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_FORWARD_DELETE = 'DID_KEYBOARD_FORWARD_DELETE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_LEFT = 'DID_KEYBOARD_LEFT';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RIGHT = 'DID_KEYBOARD_RIGHT';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UP = 'DID_KEYBOARD_UP';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DOWN = 'DID_KEYBOARD_DOWN';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PAGEUP = 'DID_KEYBOARD_PAGEUP';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PAGEDOWN = 'DID_KEYBOARD_PAGEDOWN';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SELECT_ALL = 'DID_KEYBOARD_SELECT_ALL';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_CLOSE = 'DID_KEYBOARD_CLOSE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SAVE = 'DID_KEYBOARD_SAVE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_CUT = 'DID_KEYBOARD_CUT';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_COPY = 'DID_KEYBOARD_COPY';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PASTE = 'DID_KEYBOARD_PASTE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_INDENT = 'DID_KEYBOARD_INDENT';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_OUTDENT = 'DID_KEYBOARD_OUTDENT';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_BOLD = 'DID_KEYBOARD_BOLD';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ITALIC = 'DID_KEYBOARD_ITALIC';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UNDERLINE = 'DID_KEYBOARD_UNDERLINE';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER = 'DID_KEYBOARD_MODIFIER';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER_UP = 'DID_KEYBOARD_MODIFIER_UP';
CC.Keyboard.NOTIFICATION_DID_KEYBOARD_GENERIC = 'DID_KEYBOARD_GENERIC';

Object.extend(Event, {
	CHARACTER_A: 65,
	CHARACTER_B: 66,
	CHARACTER_C: 67,
	CHARACTER_I: 73,
	CHARACTER_S: 83,
	CHARACTER_U: 85,
	CHARACTER_V: 86,
	CHARACTER_W: 87,
	CHARACTER_X: 88,
	CHARACTER_LEFT_SQUARE_BRACKET: 219,
	CHARACTER_RIGHT_SQUARE_BRACKET: 221,
	KEY_DELETE: 46,
	KEY_TAB: 9,
	KEY_SHIFT: 16,
	KEY_CONTROL: 17,
	KEY_OPTION: 18,
	KEY_COMMAND: 91,
	KEY_SPACE: 32,
	KEY_COMMA: 188,
	KEY_FORWARD_DELETE: 127
});

// Keyboard responder mixin.

CC.Keyboard.Mixins.Responder = {
	mIsKeyboardResponder: true,
	// Handles a keyboard notification returning true if the notification was
	// handled successfully and false otherwise. Returning true will prevent
	// the notification from firing elsewhere.
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) { /* Interface */ },
	willBecomeFirstResponder: function() { /* Interface */ },
	willLoseFirstResponder: function() { /* Interface */ },
	// Make this keyboard responder first responder. If another responder later
	// steals first responder status, your responder will regain first responder
	// once once the new responder loses first responder status.
	becomeFirstResponder: function() {
		this.willBecomeFirstResponder();
		globalKeyboardDelegate().mResponderChain = globalKeyboardDelegate().mResponderChain.without(this);
		globalKeyboardDelegate().pushFirstResponder(this);
	},
	// Give up first responder status.
	loseFirstResponder: function() {
		this.willLoseFirstResponder();
		globalKeyboardDelegate().mResponderChain = globalKeyboardDelegate().mResponderChain.without(this);
	}
};

// Global keyboard shortcut delegate.

CC.Keyboard.GlobalKeyboardShortcutDelegate = Class.createWithSharedInstance('globalKeyboardDelegate', true);
CC.Keyboard.GlobalKeyboardShortcutDelegate.prototype = {
	mResponderChain: null,
	initialize: function() {
		Event.observe(window, 'keydown', this.handleKeyboardEvent.bind(this));
		Event.observe(window, 'keyup', this.handleKeyboardUpEvent.bind(this));
		this.mResponderChain = new Array();
	},
	// Returns the first available responder in the responder chain.
	firstResponder: function() {
		if (this.mResponderChain.length > 0) return this.mResponderChain[0];
	},
	// Returns the next available responder after the current first responder.
	nextResponder: function() {
		if (this.mResponderChain.length > 1) return this.mResponderChain[1];
	},
	// Pushes a new first responder at the top of the responder chain.
	pushFirstResponder: function(inResponder) {
		if (!inResponder || (inResponder && !inResponder.mIsKeyboardResponder)) return;
		if (this.firstResponder() == inResponder) return;
		this.mResponderChain = this.mResponderChain.without(inResponder);
		this.mResponderChain.unshift(inResponder);
	},
	// Removes and returns the current first responder from the responder chain.
	popFirstResponder: function() {
		return this.mResponderChain.shift();
	},
	// Returns true if the user is holding the default modifier combination
	// for their platform (ctrl on Windows/Linux, cmd on Mac).
	isHoldingDefaultModifier: function(inEvent) {
		if ((browser().isWindows() || browser().isLinux()) && inEvent.ctrlKey) return false;
		else return (browser().isMacintosh() && inEvent.metaKey);
	},
	// Returns true if the user is holding the shift key.
	isHoldingShiftKey: function(inEvent) {
		return (inEvent && inEvent.shiftKey);
	},
	// Handles a keyboard event by traversing the responder chain looking for a responder that
	// successfully handles the event. Otherwise, publishes a generic keyboard notification.
	handleKeyboardEvent: function(inEvent) {
		var keyCode = inEvent.keyCode;
		if (!keyCode) return;
		// Initialize some constants.
		var notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_GENERIC;
		var optExtras = {'event': inEvent};
		// Determine the notification we will publish.
		switch (keyCode) {
			case Event.KEY_RETURN:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RETURN;
				break;
			case Event.KEY_TAB:
				notification = (this.isHoldingShiftKey(inEvent) ? CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_TAB : CC.Keyboard.NOTIFICATION_DID_KEYBOARD_TAB);
				break;
			case Event.KEY_SPACE:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SPACE;
				break;
			case Event.KEY_BACKSPACE:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_BACKSPACE;
				break;
			case Event.KEY_DELETE:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DELETE;
				break;
			case Event.KEY_FORWARD_DELETE:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_FORWARD_DELETE;
				break;
			case Event.KEY_LEFT:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_LEFT;
				break;
			case Event.KEY_RIGHT:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RIGHT;
				break;
			case Event.KEY_UP:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UP;
				break;
			case Event.KEY_DOWN:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_DOWN;
				break;
			case Event.KEY_PAGEUP:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PAGEUP;
				break;
			case Event.KEY_PAGEDOWN:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PAGEDOWN;
				break;
			case Event.KEY_ESC:
				notification = (this.isHoldingShiftKey(inEvent) ? CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_ESC : CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC);
				break;
			// Select all.
			case Event.CHARACTER_A:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SELECT_ALL;
				break;
			// Close.
			case Event.CHARACTER_W:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_CLOSE;
				break;
			// Save.
			case Event.CHARACTER_S:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SAVE;
				break;
			// Cut.
			case Event.CHARACTER_X:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_CUT;
				break;
			// Copy.
			case Event.CHARACTER_C:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_COPY;
				break;
			// Paste.
			case Event.CHARACTER_V:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_PASTE;
				break;
			// Indent.
			case Event.CHARACTER_RIGHT_SQUARE_BRACKET:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_INDENT;
				break;
			// Outdent.
			case Event.CHARACTER_LEFT_SQUARE_BRACKET:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_OUTDENT;
				break;
			// Bold.
			case Event.CHARACTER_B:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_BOLD;
				break;
			// Italic.
			case Event.CHARACTER_I:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ITALIC;
				break;
			// Underline.
			case Event.CHARACTER_U:
				if (!this.isHoldingDefaultModifier(inEvent)) break;
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_UNDERLINE;
				break;
			// Modifier.
			case Event.KEY_SHIFT:
			case Event.KEY_CONTROL:
			case Event.KEY_OPTION:
			case Event.KEY_COMMAND:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER;
				break;
		}
		// Is there a responder in the chain that wants to handle the notification?
		var responderIdx, responder, processed;
		for (var responderIdx = 0; responderIdx < this.mResponderChain.length; responderIdx++) {
			responder = this.mResponderChain[responderIdx];
			if (responder && (responder.handleKeyboardNotification(notification, undefined, optExtras) == true)) {
				processed = true;
				break;
			}
		}
		// Otherwise, publish a notification.
		if (!processed) {
			logger().debug("dispatchKeyboardNotification: %o %o", notification, optExtras);
			globalNotificationCenter().publish(notification, undefined, optExtras);
			return false;
		}
		return true;
	},
	// Handles a keyboard event by traversing the responder chain looking for a responder that
	// successfully handles the event. Otherwise, publishes a generic keyboard notification.
	// Up events are only processed for modifier keys.
	handleKeyboardUpEvent: function(inEvent) {
		var keyCode = inEvent.keyCode;
		if (!keyCode) return;
		// Initialize some constants.
		var notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_GENERIC;
		var optExtras = {'event': inEvent};
		// Determine the notification we will publish.
		switch (keyCode) {
			// Modifier.
			case Event.KEY_SHIFT:
			case Event.KEY_CONTROL:
			case Event.KEY_OPTION:
			case Event.KEY_COMMAND:
				notification = CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER_UP;
				break;
		}
		if (notification != CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER_UP) return;
		// Go straight to publishing a notification.
		logger().debug("dispatchKeyboardNotification: %o %o", notification, optExtras);
		globalNotificationCenter().publish(notification, undefined, optExtras);
		return false;
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.metaCache = {};
CC.Meta = {};
CC.Meta.NOTIFICATION_DID_REFRESH_META_TAGS = 'NOTIFICATION_DID_REFRESH_META_TAGS';

CC.meta = function(name, inOptForceRecalculate) {
	var cachedValue = CC.metaCache[name];
	if (cachedValue && !inOptForceRecalculate) return cachedValue;
	var node = $$('meta[name='+ name +']').first();
	var val = (node ? node.readAttribute('content') : '');
	CC.metaCache[name] = val;
	return val;
};

CC.metaAsArray = function(name, inOptForceRecalculate) {
	var meta = CC.meta(name, inOptForceRecalculate);
	var result = (meta || "").split(',');
	if (result && result.length == 1 && result[0] == "") return [];
	return result;
};

CC.setMeta = function(name, val) {
	CC.metaCache[name] = val;
	var node = $$('meta[name='+ name +']').first();
	if (node)
		node.writeAttribute('content', val);
	else
	{
		node = document.createElement('meta');
		node.writeAttribute('name', name);
		node.writeAttribute('content', val);
		document.head.appendChild(node);
	}
};

// Theme tag meta helpers.

CC.themeTupleFromMetaTag = function(inOptEntityOwnerOrContainerString) {
	var target = (inOptEntityOwnerOrContainerString || "container");
	var themeParts = new Array(3);
	var containerThemeInfo = (CC.meta("x-apple-%@-themeInfo".fmt(target)) || "");
	var splitContainerThemeInfo = containerThemeInfo.split(',');
	for (var sdx = 0; sdx < splitContainerThemeInfo.length; sdx++) {
		var t = splitContainerThemeInfo[sdx];
		if (t != undefined) {
			themeParts[sdx] = t.strip();
		}
	}
	return themeParts;
};

// Calendar meta helpers.

CC.calendarMetaTagsEnabledForContainer = function() {
	return (CC.meta("x-apple-container-isCalendarEnabled") == "true");
};

// Blog meta helpers.

CC.blogMetaTagsEnabledForContainer = function() {
	var isBlogEnabled = false;
	if (CC.meta('x-apple-owner-type') == 'com.apple.entity.User') {
		isBlogEnabled = (CC.meta("x-apple-owner-isBlogEnabled") == "true");
	}
	else {
		isBlogEnabled = (CC.meta("x-apple-container-isBlogEnabled") == "true");
	}
	return isBlogEnabled;
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// A nextTick method which ensures that the passed function will be run on the next
// iteration of the event loop. Uses setTimeout(..., 0) as a fallback, but on supporting
// browsers, uses window.postMessage, which is significantly more efficient: http://jsperf.com/postmessage



CC.RunLoop = CC.RunLoop || new Object();
CC.RunLoop._usePostMessage = (window.postMessage != null);
CC.RunLoop._pendingMessages = [];
CC.RunLoop.nextTick = function(inCallback, inOptContext) {
   if (CC.RunLoop._usePostMessage) {
       CC.RunLoop._pendingMessages.push([inCallback, inOptContext]);
       window.postMessage('__cc-nextTick', '*');
   } else {
       if (inOptContext != null) {
           setTimeout(function() {
               inCallback.call(inOptContext);
           }, 0);
       } else {
           setTimeout(inCallback, 0);
       }
   }
};

if (browserSupportsAddEventListener()) {
	window.addEventListener('message', function(e){
	   if (e.source == window && e.data == '__cc-nextTick') {
	       e.stopPropagation();

	       while (CC.RunLoop._pendingMessages.length > 0) {
	           var fn = CC.RunLoop._pendingMessages.shift();
	           if (fn[1] != null)
	               fn[0].call(fn[1]);
	           else
	               fn[0]();
	       }
	   }
	}, false);
}
;
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.ServiceClient = CC.ServiceClient || new Object();

// Simple JSON encoder/decoder classes.

CC.ServiceClient.JSONEncoder = Class.create({
	encode_object: function(obj) {
		return JSON.stringify(obj);
	}
});

CC.ServiceClient.JSONDecoder = Class.create({
	decode_object: function(data) {
		return JSON.parse(data, function(key, val) {
			if (val && val.type && val.type == 'com.apple.DateTime') {
				return dateFromCSDateTime(val);
			}
			return val;
		});
	}
});

// Service client instance.

CC.ServiceClient.ServiceClientSharedInstance = Class.createWithSharedInstance('service_client');
CC.ServiceClient.ServiceClientSharedInstance.prototype = {
	basePath: "/xcs/svc",
	encoder: null,
	decoder: null,
	session_guid: null,
	referencedObjects: null,
	// Automatic request batching support.
	autobatchRequests: true,
	autobatchWindow: 100, // 100ms
	autobatchQueue: [],
	initialize: function() {
		this.encoder = new CC.ServiceClient.JSONEncoder();
		this.decoder = new CC.ServiceClient.JSONDecoder();
	},
	__httpPUT: function(inRequestData, inCallback, inErrback) {
		logger().info(inRequestData);
		return new Ajax.Request(this.basePath, {
			method: 'put',
			contentType: 'application/json',
			postBody: inRequestData,
			onSuccess: function(response) {
				var unpacked = this.unpackResponse(response);
				return inCallback(unpacked);
			}.bind(this),
			onFailure: inErrback
		});
	},
	__sendRequestAsynchronously: function(inRequest, inOptions, inCallback, inErrback) {
		if (inOptions != undefined) {
			// If this is a batch request, auto-forward request options to individual requests in the batch.
			// Otherwise set request options on the request itself.
			if (inRequest.type == "com.apple.BatchServiceRequest") {
				var requests = inRequest.requests;
				for (var requestIdx = 0; requestIdx < requests.length; requestIdx++) {
					var request = this.setRequestOptionsForRequest(requests[requestIdx], inOptions);
					requests[requestIdx] = request;
				}
			} else {
				inRequest = this.setRequestOptionsForRequest(inRequest, inOptions);
			}
		}
		// Encode the request.
		var requestData = this.encoder.encode_object(inRequest);
		// Make the request.
		return this.__httpPUT(requestData, function(response) {
			// Catch CSSessionRequiredError exception and force-rebuild the session.
			if (response && response.response && response.response.exceptionName) {
			 	if (response.response.exceptionName == 'CSSessionRequiredError') {
					sessions().currentOrNewSessionAsynchronously(true, function(session) {
						return this.__sendRequestAsynchronously(inRequest, inOptions, inCallback, inErrback);
					}.bind(this), Prototype.emptyFunction)
					return;
				}
				logger().error("Exception: " + response.response.exceptionName + " " + response.response.exceptionString);
				if (inErrback) inErrback(response);
				return;
			}
			if (inCallback) inCallback(response);
			return;
		}.bind(this), inErrback);
	},
	// Immediately flushes the autobatched service request queue.
	flushQueuedServiceRequests: function() {
		setTimeout(this.__flushAutobatchQueue.bind(this), 10);
	},
	// Flushes the current set of queued requests by packaging them up in a single batch request.
	__flushAutobatchQueue: function() {
		var queue = this.autobatchQueue;
		this.autobatchQueue = [];
		logger().info("Flushing service client autobatched request queue (%@ items)".fmt(queue.length));
		// Do we have anything in the queue to flush?
		if (!queue || queue.length == 0) return;
		// Build a new batch request by iterating the autobatch queue.
		var batchedRequest = new CC.EntityTypes.BatchServiceRequest();
		var requests = [], orderedCallbackTuples = [];
		for (var idx = 0; idx < queue.length; idx++) {
			var item = queue[idx];
			var request = item[0], options = item[1], callback = item[2], errback = item[3];
			// If the queued request is already a batch request, something is badly wrong.
			if (request.type == "com.apple.BatchServiceRequest") {
				logger().error("Found a com.apple.BatchServiceRequest request in the service client autobatch queue (%@)... skipping", request);
				continue;
			} else {
				if (options) request = this.setRequestOptionsForRequest(request, options);
				requests.push(request);
				logger().info("    Included request: %@ %@".fmt(request.serviceName, request.methodName));
				orderedCallbackTuples.push([callback, errback]);
			}
		}
		// Actually make the service request.
		batchedRequest.requests = requests;
		(function(callbackTuples) {
			this.__sendRequestAsynchronously(batchedRequest, undefined, function(response) {
				// Intercept the response so we can call any callbacks/errbacks in order.
				var _responses = $A(response.responses);
				for (var rdx = 0; rdx < _responses.length; rdx++) {
					var _response = _responses[rdx];
					var callbacks = callbackTuples[rdx];
					if (_response && _response.succeeded) {
						logger().debug("Got batched response %@, dispatching result to callback function", _response);
						(callbacks[0] || Prototype.emptyFunction)(_response);
					} else {
						logger().debug("Got batched response %@, dispatching result to errback function", _response);
						(callbacks[1] || Prototype.emptyFunction)(_response);
					}
				}
			}, function() {
				logger().error("Failed to flush autobatch queue because an error occurred");
			});
		}.bind(this))(orderedCallbackTuples);
	},
	queueRequest: function(inRequest, inOptions, inCallback, inErrback) {
		// Enqueue the request in the autobatch queue. If autobatching is enabled and we don't have an active
		// timer, create a new queue flushing timer which flushes the autobatch queue. If autobatching is disabled
		// flush the autobatch queue right away without using a timer.
		this.autobatchQueue.push([inRequest, inOptions, inCallback, inErrback]);
		// Do we need to flush the autobatch queue?
		if (this.autobatchRequests) {
			if (!this.autobatchQueueTimer) {
				this.autobatchQueueTimer = setTimeout(function() {
					delete this.autobatchQueueTimer;
					this.__flushAutobatchQueue();
				}.bind(this), this.autobatchWindow);
			}
		} else {
			this.__flushAutobatchQueue();
		}
	},
	executeAsynchronously: function(inService, inMethod, inParams, inOptions, inCallback, inErrback) {
		var request = new CC.EntityTypes.ServiceRequest();
		var sessionGUID = sessions().currentSessionCookie();
		request.sessionGUID = sessionGUID;
		request.serviceName = inService;
		request.methodName = inMethod;
		if (inParams) request.arguments = Object.isArray(inParams) ? inParams : [inParams];
		this.queueRequest(request, inOptions, inCallback, inErrback);
	},
	batchExecuteAsynchronously: function(inBatched, inOptions, inCallback, inErrback) {
		var request;
		var sessionGUID = sessions().currentSessionCookie();
		var batchedRequest = new CC.EntityTypes.BatchServiceRequest();
		batchedRequest.requests = $A(inBatched).map(function(arg) {
			request = new CC.EntityTypes.ServiceRequest();
			request.sessionGUID = sessionGUID;
			request.serviceName = arg[0];
			request.methodName = arg[1];
			if (arg.length > 2 && arg[2]) {
				request.arguments = (Object.isArray(arg[2]) ? arg[2] : [arg[2]]);
			}
			if (arg.length > 3 && arg[3]) {
				request = this.setRequestOptionsForRequest(request, arg[3]);
			}
			return request;
		}.bind(this));
		this.__sendRequestAsynchronously(batchedRequest, inOptions, inCallback, inErrback);
	},
	paginateAsynchronously: function(inService, inMethod, inParams, inOptions, inPaginationGUID, inPaginationStartIndex, inPaginationHowMany, inCallback, inErrback) {
		// Create the inner service request we will paginate.
		var request = new CC.EntityTypes.ServiceRequest();
		var sessionGUID = sessions().currentSessionCookie();
		request.sessionGUID = sessionGUID;
		request.serviceName = inService;
		request.methodName = inMethod;
		request.expandReferencedObjects = false;
		if (inParams) request.arguments = Object.isArray(inParams) ? inParams : [inParams];
		// Create the pagination request.
		var pagination = new CC.EntityTypes.PaginationRequest();
		pagination.serviceRequest = request;
		pagination.guid = inPaginationGUID;
		pagination.startIndex = inPaginationStartIndex;
		pagination.resultsLimit = inPaginationHowMany;
		// Create a wrapping service request.
		var service = new CC.EntityTypes.ServiceRequest();
		service.sessionGUID = sessionGUID;
		service.serviceName = 'ContentService';
		service.methodName = 'paginateRequest:'
		service.arguments = [pagination];
		this.__sendRequestAsynchronously(service, inOptions, inCallback, inErrback);
	},
	// Returns a tuple of response (either an response or an ordered array of responses) and an optional
	// array of referenced objects for a service request.
	unpackResponse: function(inResponse) {
		if (!inResponse) return undefined;
		var responseText = inResponse.responseText;
		var decodedResponse = this.decoder.decode_object(responseText);
		if (decodedResponse.type == "com.apple.ServiceResponse") {
			return new CC.EntityTypes.ServiceResponse(decodedResponse);
		} else if (decodedResponse.type == "com.apple.BatchServiceResponse") {
			return new CC.EntityTypes.BatchServiceResponse({'responses': decodedResponse.responses});
		} else if (decodedResponse.type == "com.apple.PaginatedResponse") {
			return new CC.EntityTypes.PaginatedResponse(decodedResponse.response);
		}
		return inResponse;
	},
	// Internal method that maps an options hash to properties on an individual request. Doesn't replace existing request properties.
	// You shouldn't normally call this method yourself.
	setRequestOptionsForRequest: function(inRequest, inOptions) {
		if (inRequest && inOptions) {
			if (inOptions.adminAuthorizationRef != undefined && inRequest.adminAuthorizationRef == undefined) inRequest.adminAuthorizationRef = inOptions.adminAuthorizationRef;
			inRequest.expandReferencedObjects = (inOptions.expandReferencedObjects == undefined ? false : (inOptions.expandReferencedObjects == true ? true : false));
			if (inOptions.referencedPathsToFollow != undefined && inRequest.referencedPathsToFollow == undefined) inRequest.referencedPathsToFollow = inOptions.referencedPathsToFollow;
			if (inOptions.subpropertyPaths != undefined && inRequest.subpropertyPaths == undefined) inRequest.subpropertyPaths = inOptions.subpropertyPaths;
			if (inOptions.clientURL != undefined && inRequest.clientURL == undefined) inRequest.clientURL = inOptions.clientURL;
			if (inOptions.hints != undefined && inRequest.hints == undefined) inRequest.hints = inOptions.hints;
		}
		return inRequest;
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



// Store tracking objects returned from the server, local modifications to those objects,
// and responsible for building changesets for objects that can be pushed back to the server.

CC.Store = CC.Store || new Object();

CC.Store.BackingStore = Class.create(CC.Object, {
	// Hash tracking objects as returned by the server. Cannonical unaltered copies.
	_store: null,
	// A set of working copies for each object in the store.
	_workingCopies: null,
	// A set of working changes for objects in the working copy store.
	_changes: null,
	// A set of deferred changes for objects in the working copy store.
	_deferredChanges: null,
	_deferredChangesOrderStack: null,
	// Initialize the store.
	initialize: function() { this.purgeStore(); },
	// Push a new model into the store. We only support instances of our
	// CC.Mvc.Model base class. Returns a working copy if the object was
	// successfully added to the store, and undefined otherwise.
	pushObject: function(inObject) {
		if (!inObject || !inObject.isModel || !inObject.guid) return undefined;
		var guid = inObject.guid;
		// Add the object to the store.
		this._store.set(guid, inObject);
		// Clone and return a working copy.
		var workingCopy = CC.deepClone(inObject);
		this._workingCopies.set(guid, workingCopy);
		// Keep the store consistent by nuking any changes for this guid.
		this._changes.unset(guid);
		logger().debug("pushObject: %o", inObject);
		return workingCopy;
	},
	// Pushes an individual change for an object into the store. Returns
	// true if the change was successfully added and false otherwise.
	pushChangeForObject: function(inObject, inPropertyPath, inChange) {
		if (!inObject || !inObject.isModel || !inPropertyPath) return false;
		// Fetch the changelist for the object.
		var guid = inObject.guid;
		if (!guid || !this._store.get(guid)) return false;
		var changelist = this._changes.get(guid);
		if (!changelist) changelist = this._changes.set(guid, {});
		// Update the changelist.
		changelist[inPropertyPath] = inChange;
		// Update the working copy.
		var workingCopy = this._workingCopies.get(guid);
		if (!workingCopy) return false;
		if (inPropertyPath.indexOf('.') == -1) {
			workingCopy[inPropertyPath] = inChange;
		}
		else {
			// We have a property path, so get a reference to the property we're
			// trying to update.
			var matches = inPropertyPath.match(/(.*)\.(\w+)$/);
			if (!matches.length || matches.length < 3) return false;
			var path = matches[1], attribute = matches[2];
			var property = CC.objectForPropertyPath(path, workingCopy);
			if (!property) {
				var property = {};
				var subproperty = property;
				for (var idx = 0; idx < matches.length; idx++) {
					subproperty = subproperty[matches[idx]] = {};
				}
			}
			property[attribute] = inChange;
		}
		logger().debug("pushChangeForObject: %o %o %o", inObject, inPropertyPath, inChange);
		return true;
	},
	// Pushes a bulk change for an object into the store.
	pushBulkChangeForObject: function(inObject, inBulkChanges) {
		if (!inObject || !inObject.isModel || !inBulkChanges) return false;
		for (var key in inBulkChanges) {
			if (inBulkChanges.hasOwnProperty(key)) {
				this.pushBulkChangeForObject(inObject, key, inBulkChanges[key]);
			}
		}
		logger().debug("pushBulkChangeForObject: %o %o", inObject, inBulkChanges);
		return true;
	},
	// Pushes a deferred individual change for an object into the store. A deferred
	// change is determined by the object being updated, the property being changed
	// and a callback function calculating the new value. Deferred values will be
	// calculated once calculateDeferredChanges() is called on the parent store.
	// Deferred store changes are calculated in the order in which they were pushed.
	// Returns true if the change was successfully queued, and false otherwise.
	pushChangeForObjectUsingDeferred: function(inObject, inPropertyPath, inCallback) {
		if (!inObject || !inObject.isModel || !inPropertyPath) return false;
		// Fetch the list of deferred changes for the object.
		var guid = inObject.guid;
		if (!guid || !this._store.get(guid)) return false
		var deferred = this._deferredChanges.get(guid);
		if (!deferred) deferred = this._deferredChanges.set(guid, []);
		// Each deferred change is stored as a property and callback tuple.
		var change = [inPropertyPath, inCallback];
		deferred.push(change);
		this._deferredChanges.set(guid, deferred);
		if (!this._deferredChangesReverseMap.get(guid)) {
			this._deferredChangesStack.push(guid);
			this._deferredChangesReverseMap.set(guid, true);
		}
		logger().debug("pushDeferredChangeForObject: %o %o %o", inObject, inPropertyPath, inCallback);
		return true;
	},
	// Returns the working copy for an object with a given GUID.
	workingCopyForGUID: function(inGUID) {
		return (inGUID && this._workingCopies && this._workingCopies.get(inGUID));
	},
	// Removes an object with a given identifer from the store if it exists.
	// Returns the object where it was successfully removed, and undefined
	// otherwise.
	popObject: function(inGUID) {
		if (!inGUID || !this._store.get(inGUID)) return undefined;
		this._changes.unset(inGUID);
		return this._store.unset(inGUID);
	},
	// Deletes everything from the store.
	purgeStore: function() {
		this._store = new Hash();
		this._workingCopies = new Hash();
		this.purgeChangesFromStore();
	},
	purgeChangesFromStore: function() {
		this._changes = new Hash();
		this._deferredChanges = new Hash();
		this._deferredChangesStack = new Array();
		this._deferredChangesReverseMap = new Hash();
	},
	// Deletes any trace of a given GUID from the store.
	purgeGUID: function(inGUID) {
		if (!inGUID || !this._store.get(inGUID)) return false;
		this._store.unset(inGUID);
		this._changes.unset(inGUID);
		this._workingCopies.unset(inGUID);
		this._deferredChanges.unset(inGUID);
		return true;
	},
	// Calculates any deferred record changes, pushing the results back into the store.
	// If inOptCalculateOnly is specified, changes are calculated and returned without
	// being pushed into the store.
	calculateDeferredChanges: function(inOptCalculateOnly) {
		var deferredChanges = this._deferredChanges;
		var deferredGUIDs = this._deferredChangesStack;
		if (!deferredGUIDs || deferredGUIDs.length == 0) return [];
		var result = {}, deferredChangeIdx, deferredGUID;
		for (deferredGUIDIdx = 0; deferredGUIDIdx < deferredGUIDs.length; deferredGUIDIdx++) {
			deferredGUID = deferredGUIDs[deferredGUIDIdx];
			result[deferredGUID] = this.calculateDeferredChangesForGUID(deferredGUID, inOptCalculateOnly);
		}
		logger().debug("calculateDeferredChanges: %o %o", inOptCalculateOnly, result);
		return result;
	},
	// Calculates any deferred record changes for a given block guid, pushing the results back
	// into the store. If inOptCalculateOnly is specified, changes are calculated and returned
	// without being pushed into the store.
	calculateDeferredChangesForGUID: function(inGUID, inOptCalculateOnly) {
		if (!inGUID) return undefined;
		var deferredChanges = this._deferredChanges.get(inGUID);
		if (!deferredChanges || deferredChanges.length == 0) return [];
		var deferredChangeIdx, deferredChange, deferredChangePropertyPath, deferredChangeCallback, value, result = [];
		for (deferredChangeIdx = 0; deferredChangeIdx < deferredChanges.length; deferredChangeIdx++) {
			deferredChange = deferredChanges[deferredChangeIdx];
			deferredChangePropertyPath = deferredChange[0];
			deferredChangeCallback = deferredChange[1];
			// Evaluate the deferred property.
			value = (deferredChangeCallback ? deferredChangeCallback() : undefined);
			// Push the evaluated property onto the changeset for this GUID.
			result.push([deferredChangePropertyPath, value, null]);
			// Bail early if we're calculating deferred changes only.
			if (inOptCalculateOnly) continue;
			// Otherwise push the change into the store.
			this.pushChangeForObject(this._workingCopies.get(inGUID), deferredChangePropertyPath, value);
		}
		logger().debug("calculateDeferredChangesForGUID: %o %o %o", inGUID, (inOptCalculateOnly == true), result);
		return result;
	},
	// Builds a changeset for a model with a given guid. Returns a changeset, which
	// is a dictionary of revision (an integer) and changes (a tuple of key, new value
	// pairs and timestamp).
	buildChangesetForObjectWithGUID: function(inGUID) {
		if (!inGUID) return undefined;
		var changeset = [], changelist = this._changes.get(inGUID);
		if (!changelist) return undefined;
		// Get the working copy so we can calculate which attributes to include
		// in the changeset.
		var workingCopy = this._workingCopies.get(inGUID);
		if (!workingCopy || !workingCopy.isChangeAware) return undefined;
		var attributes = workingCopy.changesetAttributes();
		// Track any keys we've already added to the changeset.
		var changeKeysSoFar = $A([]);
		// Build the changeset.
		var propertyPath, value, type;
		for (var key in changelist) {
			propertyPath = key;
			// Only consider the root of a property path.
			if (propertyPath.match(/\./)) propertyPath = propertyPath.split('.')[0];
			// Bail if the property is not flagged for inclusion in a changeset.
			if (attributes.indexOf(propertyPath) == -1) continue;
			value = workingCopy[propertyPath];
			// Map any fancy attributes to vanilla objects.
			if ((type = CC.typeOf(value)) && (type == CC.T_OBJECT || type == CC.T_HASH) && value.toObject) value = value.toObject();
			if (changeKeysSoFar.include(propertyPath)) continue;
			changeset.push([propertyPath, value, null]);
			changeKeysSoFar.push(propertyPath);
		}
		return changeset
	},
	// Bulk builds a set of changesets for an array of models. Returns
	// a dictionary of changesets keyed by model guid.
	buildChangesetForObjectsWithGUIDs: function(inGUIDs) {
		var changesets = {}, guidIdx, guid;
		if (!inGUIDs) return changesets;
		if (CC.typeOf(inGUIDs) != 'array') inGUIDs = [inGUIDs];
		for (guidIdx = 0; guidIdx < inGUIDs.length; guidIdx++) {
			guid = inGUIDs[guidIdx];
			changesets[guid] = this.buildChangesetForObjectWithGUID(guid);
		}
		logger().debug("buildChangesetForObjectWithGUIDs: %o %o", inGUIDs, changesets);
		return changesets;
	},
	// Returns a hash of changesets for all modified objects in the store.
	allChanges: function() {
		return this.buildChangesetForObjectsWithGUIDs(this._changes.keys());
	},
	// Returns a double-array of object guids and changests for all modified objects with a matching type in the store.
	allChangesForModelType: function(inType) {
		if (!inType) return [];
		var guids = [];
		var workingCopyValues = this._workingCopies.values(), workingCopyValueIdx, workingCopyValue;
		for (workingCopyValueIdx = 0; workingCopyValueIdx < workingCopyValues.length; workingCopyValueIdx++) {
			workingCopyValue = workingCopyValues[workingCopyValueIdx];
			if (workingCopyValue.isModel && workingCopyValue.type == inType) guids.push(workingCopyValue.guid);
		}
		return this.buildChangesetForObjectsWithGUIDs(guids);
	},
	// Returns true if the store has unsaved changes.
	hasUnsavedChanges: function() {
		return (this._changes.size() > 0 || this._deferredChanges.size() > 0);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.




CC.ServerProxy = CC.ServerProxy || new Object();

// A server proxy shared instance.

CC.ServerProxy.SharedInstance = Class.createWithSharedInstance('server_proxy');
CC.ServerProxy.SharedInstance.prototype = {
	mDefaultSubpropertyPaths: {
		'containerGUID.longName': 'container.longName',
		'containerGUID.shortName': 'container.shortName',
		'containerGUID.type': 'container.type',
		'containerGUID.avatarGUID': 'container.avatarGUID',
		'containerGUID.tinyID': 'container.tinyID',
		'containerGUID.isHidden': 'container.isHidden',
		'updatedByUserGUID.longName': 'updatedByUser.longName',
		'updatedByUserGUID.shortName': 'updatedByUser.shortName',
		'updatedByUserGUID.type': 'updatedByUser.type',
		'updatedByUserGUID.avatarGUID': 'updatedByUser.avatarGUID',
		'updatedByUserGUID.tinyID': 'updatedByUser.tinyID',
		'createdByUserGUID.longName': 'createdByUser.longName',
		'createdByUserGUID.shortName': 'createdByUser.shortName',
		'createdByUserGUID.type': 'createdByUser.type',
		'createdByUserGUID.avatarGUID': 'createdByUser.avatarGUID',
		'createdByUserGUID.tinyID': 'createdByUser.tinyID'
	},
	mDefaultSearchHowMany: 10,
	mDefaultSearchFields: ['tinyID', 'longName', 'themeInfo', 'shortName', 'type', 'createTime', 'updateTime', 'isFavorite', 'isDeleted', 'tags', 'avatarGUID', 'previewGUIDs', 'thumbnailGUIDs', 'iconGUID', 'description'],
	mDefaultSearchSortFields: ['+longName'],
	mDefaultActivityTotalResultLimit: 500,
	mDefaultActivitySubFields: {
		'entityGUID.longName': 'entityLongName',
		'entityGUID.shortName': 'entityShortName',
		'entityGUID.tinyID': 'entityTinyID',
		'entityGUID.type': 'entityType',
		'containerGUID.longName': 'ownerLongName',
		'containerGUID.shortName': 'ownerShortName',
		'containerGUID.tinyID': 'ownerTinyID',
		'containerGUID.type': 'ownerType',
		'containerGUID.avatarGUID': 'ownerAvatarGUID',
		'userGUID.longName': 'userLongName',
		'userGUID.shortName': 'userShortName',
		'userGUID.tinyID': 'userTinyID',
		'userGUID.type': 'userType',
		'userGUID.avatarGUID': 'userAvatarGUID'
	},
	mDefaultRecentDocumentsLimit: 5,
	mStore: new CC.Store.BackingStore(),
	initialize: function() {},
	// Store convenience function.
	objectFromStoreWithGUID: function(inGUID) {
		return this.mStore.workingCopyForGUID(inGUID);
	},
	// Default entities callback. Returns an array of store-added model objects.
	_defaultEntitiesCallback: function(inResponse, inCallback, inErrback) {
		if (inResponse && inResponse.response) {
			var response = $A(inResponse.response);
			var entities = this._parseAndStoreEntities(response);
			return inCallback(entities);
		}
		if (inErrback) return inErrback(inResponse);
	},
	// Default paginated entities callback. Takes a paginated response, and maps the result to models in the
	// local backing store. Returns a tuple of (results, startIndex, total, paginationGUID) which is enough to
	// request future windows in this paginated set. You shouldn't really call this manually.
	_defaultPaginatedEntitiesCallback: function(inResponse, inCallback, inErrback) {
		if (inResponse && inResponse.response) {
			var paginated = new CC.EntityTypes.PaginatedResult(inResponse.response);
			var models = this._parseAndStoreEntities(paginated.results);
			return inCallback(models, paginated.startIndex, paginated.total, paginated.guid);
		}
		return inErrback(inResponse);
	},
	// Default search callback. Returns an  array of search result objects (note that they
	// are not automatically added to the store).
	_defaultSearchResultsCallback: function(inResponse, inCallback, inErrback) {
		if (inResponse && inResponse.response) {
			var results = (inResponse.response.results || []);
			return inCallback(results);
		}
		if (inErrback) return inErrback(inResponse);
	},
	// Generic pagination method for paginating a service method, and pushing the results into the local backing
	// store. Note that the results must be valid entity_types models to be pushed into the store correctly. You
	// shouldn't really call this manually.
	_paginateAndStoreEntities: function(inServiceName, inMethodName, inArguments, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultPaginatedEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		service_client().paginateAsynchronously(inServiceName, inMethodName, inArguments, {}, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, _callback.bind(this), inErrback);
	},
	// Maps an array of JSON structures to model objects, and pushes them into the store.
	// Returns an array of store-based models. This should only be called for models you
	// want to retain in the server_proxy backing store.
	_parseAndStoreEntities: function(models) {
		var stored = [];
		if (models && models.length) {
			var model, storedModel;
			for (var modelIdx = 0; modelIdx < models.length; modelIdx++) {
				model = models[modelIdx];
				storedModel = this._parseAndStoreEntity(model);
				if (storedModel) stored.push(storedModel);
			}
		}
		return stored;
	},
	_parseSearchResultsAndStoreEntities: function(searchResults) {
		var stored = searchResults.collect(function(result) {
			var entity = this._parseAndStoreEntity(result.entity);
			entity.snippets = result.snippets;
			return entity;
		}, this);
		return stored;
	},
	_parseAndStoreEntity: function(model) {
		if (!model || !model.type || model.type == "com.apple.EntityPlaceholder") return;
		var entity = entity_types().entityForHash(model);
		var pushed = this.mStore.pushObject(entity);
		return pushed;
	},
	// Returns all entities for a given type.
	entitiesForType: function(inType, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entitiesForType:', inType, {}, _callback, inErrback);
	},
	// Paginated version of entities for a given type.
	paginatedEntitiesForType: function(inType, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultPaginatedEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		service_client().paginateAsynchronously('ContentService', 'entitiesForType:', inType, {}, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, _callback, inErrback);
	},
	// Returns all document entities under a given container GUID.
	documentsForContainer: function(inGUID, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entitiesForType:inContainerGUID:', ['com.apple.entity.Document', inGUID], {}, _callback, inErrback);
	},
	// Returns an entity by GUID.
	entityForGUID: function(inGUID, inCallback, inErrback) {
		return this.entityForGUIDWithOptions(inGUID, {}, inCallback, inErrback);
	},
	// Returns an entity by GUID with options.
	entityForGUIDWithOptions: function(inGUID, inOptions, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			var entity = this._parseAndStoreEntity(response);
			if (!entity) return inErrback(response);
			if (inCallback) inCallback(entity);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entityForGUID:', inGUID, inOptions || {}, _callback, inErrback);
	},
	// Returns an array of entities by GUID.
	entitiesForGUIDs: function(inGUIDs, inCallback, inErrback) {
		return this.entitiesForGUIDsWithOptions(inGUIDs, {}, inCallback, inErrback);
	},
	// Returns an array of entities by GUID with options.
	entitiesForGUIDsWithOptions: function(inGUIDs, inOptions, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entitiesForGUIDs:', [inGUIDs], inOptions || {}, _callback, inErrback);
	},
	entitiesForGUIDsWithInternalTags: function(inGUIDs, inCallback, inErrback) {
		return this.entitiesForGUIDsWithInternalTagsWithOptions(inGUIDs, {}, inCallback, inErrback);
	},
	entitiesForGUIDsWithInternalTagsWithOptions: function(inGUIDs, inOptions, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entitiesForGUIDs:withInternalTags:', [inGUIDs, true], inOptions || {}, _callback, inErrback);
	},
	// Returns an entity by tinyID.
	entityForTinyID: function(inTinyID, inCallback, inErrback) {
		return this.entityForTinyIDWithOptions(inTinyID, {}, inCallback, inErrback);
	},
	// Returns an entity by tinyID with options.
	entityForTinyIDWithOptions: function(inTinyID, inOptions, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			var entity = this._parseAndStoreEntity(response);
			if (!entity) return inErrback(response);
			if (inCallback) inCallback(entity);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'entityForTinyID:', inTinyID, inOptions || {}, _callback, inErrback);
	},
	entityForLogin: function(inLogin, inCallback, inErrback) {
		return this.entityForLoginWithOptions(inLogin, {}, inCallback, inErrback)
	},
	entityForLoginWithOptions: function(inLogin, inOptions, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			var entity = this._parseAndStoreEntity(response);
			if (!entity) return inErrback(response);
			if (inCallback) inCallback(entity);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'bestGuessForUserEntityForLogin:', inLogin, inOptions || {}, _callback, inErrback);
	},
	entityForID: function(inID, inCallback, inErrback) {
		return this.entityForIDWithOptions(inID, {}, inCallback, inErrback);
	},
	entityForIDWithOptions: function(inID, inOptions, inCallback, inErrback) {
		// if it is a GUID, use that otherwise try login and tinyID
		if (looksLikeGUID(inID)) {
			return server_proxy().entityForGUIDWithOptions(inID, inOptions, inCallback, inErrback);
		}
		var _errback = function(result) {
			// assume error means we need to look it up differently
			return server_proxy().entityForLoginWithOptions(inID, inOptions, inCallback, inErrback);
		}
		return server_proxy().entityForTinyIDWithOptions(inID, inOptions, inCallback, _errback);
	},
	// repopulates the values of the meta tags for the current page
	refreshMetaTags: function(inCallback, inErrback) {
		var _callback = function(service_response) {
			for (var key in service_response.response)
			{
				if (service_response.response.hasOwnProperty(key))
					CC.setMeta(key, service_response.response[key]);
			}
			
			if (inCallback)
				inCallback();
			
			globalNotificationCenter().publish(CC.Meta.NOTIFICATION_DID_REFRESH_META_TAGS, server_proxy());
		};
		var entityID = (CC.meta('x-apple-entity-guid') == '') ? null : CC.meta('x-apple-entity-guid');
		var route = CC.meta('x-apple-route');
		return service_client().executeAsynchronously('AppContextService', 'metaTagsForEntityID:withRoute:', [entityID, route], {}, _callback, inErrback);
	},
	deleteEntityWithGUID: function(inGUID, permanently, inCallback, inErrback) {
		var methodName = permanently ? 'permanentlyDeleteEntityWithGUID:' : 'deleteEntityWithGUID:';
		return service_client().executeAsynchronously('ContentService', methodName, inGUID, {}, inCallback, inErrback);
	},
	undeleteEntityWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'undeleteEntityWithGUID:', inGUID, {}, inCallback, inErrback);
	},
	hideUserWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'hideUserWithGUID:', inGUID, {}, inCallback, inErrback);
	},
	unhideUserWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'unhideUserWithGUID:', inGUID, {}, inCallback, inErrback);
	},
	// move to a new owner
	moveEntityToOwner: function(inEntityGUID, inOwnerGUID, inCallback, inErrback) {
		var _updateCallback = function(inResult) {
			return service_client().executeAsynchronously('ContentService', 'removeACLsForEntityGUID:', inEntityGUID, {}, inCallback, inErrback);
		}
		var _getEntityCallback = function(inEntity) {
			var cs = new CC.EntityTypes.EntityChangeSet({
				'changeAction': "UPDATE",
				'entityGUID': inEntityGUID,
				'entityRevision': inEntity.revision,
				'entityType': inEntity.type,
				'changes': [["ownerGUID", inOwnerGUID]],
				'force': false
			});
			return server_proxy().updateEntityAndACLs(cs, null, _updateCallback, inErrback);
		}
		return server_proxy().entityForGUID(inEntityGUID, _getEntityCallback, inErrback);
	},
	// Returns the current revision for an entity with a given GUID as an Integer.
	revisionForEntityGUID: function(inGUID, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			var revision = (response) ? parseInt(response, 10) : null;
			if (inCallback) inCallback(revision);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'revisionForEntityGUID:', inGUID, {}, _callback, inErrback);
	},
	commentsForCommentGUIDs: function(inGUIDs, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			if (inCallback) inCallback(response);
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'commentsForGUIDs:', [inGUIDs], {}, _callback, inErrback);
	},
	commentsAndCanICommentForGUID: function(inGUID, inCallback, inErrback) {
		var batch = [
			['ContentService', 'commentsForEntityGUID:', inGUID],
			['ContentService', 'canICommentOnEntityGUID:', inGUID]
		]
		return service_client().batchExecuteAsynchronously(batch, null, function(service_response) {
			if (service_response && service_response.responses) {
				var firstResponse = service_response.responses[0];
				var secondResponse = service_response.responses[1];
				var comments = server_proxy()._parseAndStoreEntities(firstResponse.response);
				var canIcomment = secondResponse.response;
				return inCallback(comments, canIcomment);
			}
			return inErrback(service_response);
		}.bind(this), inErrback);
	},
	addCommentToOwnerGUID: function(inText, inOwnerGUID, inCallback, inErrback) {
		var newComment = {
			type: 'com.apple.EntityComment',
			entityGUID: inOwnerGUID,
			body: inText
		};
		var entity = globalEditorController().mPage.mRecord;
		var href = window.location.protocol + "//" + window.location.host;
		var entityURL = href + CC.entityURLForTypeAndGUID(entity.type, entity.guid);
		var ownerURL = href + CC.entityURLForTypeAndGUID(entity.ownerType, entity.ownerGUID);
		var clientURL = "#entity_url:%@#owner_url:%@".fmt(entityURL, ownerURL);
		
		return service_client().executeAsynchronously('ContentService', 'addComment:', newComment, {'clientURL': clientURL}, inCallback, inErrback);
	},
	deleteCommentWithGUID: function(inCommentGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'removeCommentWithGUID:', inCommentGUID, {}, inCallback, inErrback);	
	},
	approveCommentWithGUID: function(inCommentGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'approveCommentWithGUID:', inCommentGUID, {}, inCallback, inErrback);	
	},
	approveCommentsWithGUIDs: function(inGUIDs, inCallback, inErrback) {
		if (!inGUIDs) return inErrback();
		var batch = [];
		for (var idx = 0; idx < inGUIDs.length; idx++) {
			batch.push(['ContentService', 'approveCommentWithGUID:', inGUIDs[idx]]);
		}
		return service_client().batchExecuteAsynchronously(batch, null, inCallback, inErrback);
	},
	// Returns an array of relationship objects.
	relationshipsForGUID: function(inGUID, inCallback, inErrback) {
		var _callback = function(response) {
			if (response && response.response) {
				// Iterate over each of the relationship tuples we got ([relationshipGUID, otherEntity]).
				var relationships = $A(response.response);
				var relationshipModels = new Array();
				var relationship, _relationship, relationshipModel;
				for (var rdx = 0; rdx < relationships.length; rdx++) {
					// First create a relationship model for each relationship.
					relationship = relationships[rdx];
					_relationship = {'guid': relationship[0], 'targetEntityGUID': relationship[1].guid, 'sourceEntityGUID': inGUID};
					relationshipModel = new CC.EntityTypes.RelatedRelationship(_relationship);
					relationshipModels.push(this.mStore.pushObject(relationshipModel));
					// Next push the target entity into the store. Note that you'll need to ask for these later if you want them.
					this._parseAndStoreEntity(relationship[1]);
				}
				if (inCallback) inCallback(relationshipModels);
			} else {
				if (inErrback) inErrback(response);
			}
		}.bind(this);
		return service_client().executeAsynchronously('ContentService', 'relatedEntitiesForGUID:withType:', [inGUID, 'com.apple.relationship.Related'], {}, _callback, inErrback);
	},
	relateEntities: function(guid1, guid2, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'relateEntityWithGUID:toEntityWithGUID:withType:', [guid1, guid2, 'com.apple.relationship.Related'], {}, inCallback, inErrback);
	},
	relationshipsForGUIDs: function(inGUIDs, inCallback, inErrback) {
 		var _callback = function(service_response) {
			var results = $A(service_response.response || []);
			return inCallback(results);
 		};
		var guids = inGUIDs || [];
		return service_client().executeAsynchronously('ContentService', 'relationshipsForGUIDs:', [guids], {}, _callback, inErrback);
	},
	deleteRelationship: function(relationshipGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'deleteRelationshipWithGUID:', relationshipGUID, {}, inCallback, inErrback);
	},
	// Recent documents helper.  Note these methods deliberately don't push results in to the store since the results
	// have no referenced objects or subproperties expanded.  Also note the difference - recentEntitiesForUser returns
	// recent entities for the currently logged in user.  Recent documents uses search to list the last updated entities.
	recentEntitiesForUserWithLimitAndOptions: function(inLimit, inOptions, inCallback, inErrback) {
 		var _callback = function(service_response) {
			var results = $A(service_response.response || []);
			return inCallback(results);
 		};
		return service_client().executeAsynchronously('ContentService', 'recentEntitiesWithLimit:', (inLimit || this.mDefaultRecentDocumentsLimit), (inOptions || {}), _callback, inErrback);
	},
	recentEntitiesForUserForOwnerGUIDWithLimitAndOptions: function(inOwnerGUID, inLimit, inOptions, inCallback, inErrback) {
 		var _callback = function(service_response) {
			var results = $A(service_response.response || []);
			return inCallback(results);
 		};
		return service_client().executeAsynchronously('ContentService', 'recentEntitiesForOwnerGUID:withLimit:', inOwnerGUID, (inLimit || this.mDefaultRecentDocumentsLimit), (inOptions || {}), _callback, inErrback);
	},
	recentDocumentsWithOptions: function(inLimit, inOptions, inCallback, inErrback) {
		return this.recentDocumentsInOptOwnerWithOptions(inLimit, undefined, inOptions, inCallback, inErrback);
	},
	recentDocumentsInOptOwnerWithOptions: function(inLimit, inOptOwnerGUID, inOptions, inCallback, inErrback) {
		var query = this.searchQuery(undefined, ['com.apple.entity.Page', 'com.apple.entity.File'], 0, (inLimit || this.mDefaultRecentDocumentsLimit), undefined);
		this.searchQueryUpdateSort(query, '-lastActivityTime');
		if (inOptOwnerGUID) query = this.searchQueryUpdateOwnerGUID(query, inOptOwnerGUID);
		var _callback = function(service_response) {
			var results = new Array();
			if (service_response.response && service_response.response.results) {
				results = $A(service_response.response.results).collect(function(result) {
					return result.entity;
				});
			}
			return inCallback(results.without(undefined));
		}.bind(this);
		return service_client().executeAsynchronously('SearchService', 'query:', query, (inOptions || {}), _callback, inErrback);
	},
	addTagForOwner: function(inTag, inOwnerGUID, inCallback, inErrback) {
		if (!inTag.match(/\S/)) {
			inErrback({error:"Cannot add an empty tag"});
			return;
		}
		return service_client().executeAsynchronously('ContentService', 'addTag:toEntityWithGUID:', [inTag, inOwnerGUID], {}, inCallback, inErrback);
	},
	deleteTagForOwner: function(inTag, inOwnerGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'deleteTag:inOwnerGUID:', [inTag, inOwnerGUID], {}, inCallback, inErrback);
	},
	subscriptionsForEntity: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'subscriptionsForEntity:', inGUID, {}, inCallback, inErrback);
	},
	subscribeToEntityWithType: function(inGUID, inType, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'subscribeToEntity:withType:', [inGUID, inType], {}, inCallback, inErrback);
	},
	unsubscribeToEntityWithType: function(inGUID, inType, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'unsubscribeFromEntity:withType:', [inGUID, inType], {}, inCallback, inErrback);
	},
	// Creates a new page entity with a given set of page options and ACLs.
	createPageWithOptionsAndOptionalACLs: function(inOptions, inOptAcls, inCallback, inErrback) {
		var gotCurrentUser = function(currentUser) {
			// Figure out a title and whether this page is a blog post.
			var longName = (inOptions.longName || "_Page.Default.Title".loc());
			var isBlogpost = (inOptions.isBlogpost || false);
			// Did we get passed an explicit ownerGUID for the page? Fall back to the current user GUID.
			var currentUserGUID = currentUser.guid;
			var ownerGUID = (inOptions.ownerGUID ? inOptions.ownerGUID : currentUserGUID);
			var _page = {'longName': longName, 'isBlogpost': isBlogpost};
			var page = new CC.EntityTypes.PageEntity(_page);
			var variables = {'ownerGUID': ownerGUID, 'longName': longName};
			var language = globalLocalizationManager().getLprojLocale();
			// Build a batch (including ACLs if the owner is the current user and the current user is authenticated).
			var batched = [];
			if (inOptAcls) {
				batched.push(['ContentService', 'createEntitiesFromTemplate:withData:andVariables:andACL:andLanguage:', ['wiki_page', page, variables, inOptAcls, language], {}]);
			} else if ((currentUser && currentUser.isAuthenticated) && (ownerGUID == currentUserGUID)) {
				var acl = new CC.EntityTypes.EntityACL({
					'userLogin': currentUser.login,
					'userLongName': currentUser.longName,
					'userExternalID': currentUser.externalID,
					'action': 'own',
					'allow': true
				});
				batched.push(['ContentService', 'createEntitiesFromTemplate:withData:andVariables:andACL:andLanguage:', ['wiki_page', page, variables, [acl], language], {}]);
			} else {
				batched.push(['ContentService', 'createEntitiesFromTemplate:withData:andVariables:andACL:andLanguage:', ['wiki_page', page, variables, null, language], {}]);
			}
			// Unhide the creating user if they're hidden.
			if (currentUser && currentUser.isHidden && currentUser.isAuthenticated) {
				batched.push(['ContentService', 'unhideUserWithGUID:', currentUser.guid, {'hints': {'activity.ignore': true}}]);
			}
			// Define a callback.
			var _callback = function(service_response) {
				if (service_response && service_response.responses) {
					var firstResponse = service_response.responses[0];
					var entities = firstResponse.response;
					if (entities && entities[0]) {
						var storedModel = this._parseAndStoreEntity(entities[0]);
						// Immediately kick the preview queue.
						service_client().executeAsynchronously('PagePreviewService', 'kickPreviewQueue', null, Prototype.emptyFunction, Prototype.emptyFunction);
						return inCallback(storedModel);
					}
				}
				return inErrback(service_response);
			};
			// Create the page.
			return service_client().batchExecuteAsynchronously(batched, {}, _callback.bind(this), inErrback);
			
		}.bind(this);
		return sessions().currentUserAsynchronously(gotCurrentUser, inErrback);
	},
	// Creates a new project entity with a given set of project options and ACLs.
	createProjectWithOptionsAndACLs: function(inOptions, inACLs, inCallback, inErrback) {
		// Start by creating three GUIDs we can use in the batch.
		var projectGUID = (new CC.GuidBuilder()).toString();
		var detailPageGUID = (new CC.GuidBuilder()).toString();
		var blogGUID = (new CC.GuidBuilder()).toString();
		// Build up the batch by creating the project, detail page, blog and setting the project ACLs.
		var longName = (inOptions.longName || "_Project.Default.Title".loc());
		var tinyID = longName.strip().gsub(/[^\w]/, "").toLowerCase();
		if (tinyID == "") tinyID = null;
		var description = (inOptions.description || "");
		var extendedAttributes = (inOptions.extendedAttributes || {});
		var _project = {
			'guid': projectGUID,
			'tinyID': tinyID,
			'shortName': tinyID,
			'longName': longName,
			'description': description,
			'extendedAttributes': extendedAttributes,
			'detailPageGUID': detailPageGUID,
			'blogGUID': blogGUID
		}
		if (inOptions.themeInfo) _project['themeInfo'] = inOptions.themeInfo;
		if (inOptions.avatarGUID) _project['avatarGUID'] = inOptions.avatarGUID;
		var project = new CC.EntityTypes.WikiEntity(_project);
		project.setCommentAccessLevel(CC.EntityMixins.COMMENT_ACCESS_DEFAULT);
		project.setCommentModerationLevel(CC.EntityMixins.COMMENT_MODERATION_DEFAULT);
		var blogEntity = new CC.EntityTypes.BlogEntity({
			'guid': blogGUID,
			'longName': "_Blog.Default.Title".loc(),
			'ownerGUID': projectGUID
		});
		var language = globalLocalizationManager().getLprojLocale();
		var batched = [
			['ContentService', 'createEntity:', project],
			['ContentService', 'createEntitiesFromTemplate:withData:andVariables:andACL:andLanguage:', ['wiki_home', {}, {'guid': detailPageGUID, 'ownerGUID': projectGUID, 'longName': longName}, null, language], {'hints': {'activity.ignore': true}}],
			['ContentService', 'createEntity:', blogEntity, {'hints': {'activity.ignore': true}}],
			['ContentService', 'setACLs:forEntityGUID:', [inACLs, projectGUID], {'hints': {'activity.ignore': true}}]
		];
		// Define a callback.
		var _callback = function(service_response) {
			if (service_response && service_response.responses) {
				var firstResponse = service_response.responses[0];
				if (firstResponse) {
					var storedModel = this._parseAndStoreEntity(firstResponse.response);
					service_client().executeAsynchronously('PagePreviewService', 'kickPreviewQueue', null, Prototype.emptyFunction, Prototype.emptyFunction);
					return inCallback(storedModel);
				}
			}
			return inErrback(service_response);
		};
		// Create the project in a batch.
		return service_client().batchExecuteAsynchronously(batched, {'expandReferencedObjects': false}, _callback.bind(this), inErrback);
	},
	createEntity: function(inEntity, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'createEntity:', inEntity, {}, inCallback, inErrback);
	},
	updateEntity: function(inChangeset, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'updateEntity:', inChangeset, {}, function(service_response) {
			if (service_response && service_response.response) {
				var model = this._parseAndStoreEntity(service_response.response);
				return inCallback(model);
			}
			return inErrback(service_response);
		}.bind(this), inErrback);
	},
	updateEntityAndACLs: function(changeset, acls, inCallback, inErrback) {
		var batch = [
			['ContentService', 'updateEntity:', changeset]
		];
		if (acls) {
			batch.push(['ContentService', 'setACLs:forEntityGUID:', [acls, changeset.entityGUID]]);
		}
		return service_client().batchExecuteAsynchronously(batch, {'expandReferencedObjects': false}, function(service_response){
			if (service_response && service_response.responses) {
				var firstResponse = service_response.responses[0];
				this._parseAndStoreEntity(firstResponse.response);
				return inCallback();
			}
			return inErrback(service_response);
		}.bind(this), inErrback);
	},
	saveQueryAsSavedSearchWithName: function(inQuery, inName, inCallback, inErrback) {
		var savedSearch = new CC.EntityTypes.SavedQuery({
			'longName': (inName || ""),
			'query': inQuery
		});
		return server_proxy().createEntity(savedSearch, inCallback, inErrback);
	},
	savedSearchesForCurrentUser: function(inCallback, inErrback) {
		sessions().currentUserAsynchronously(function(currentUser) {
			if (currentUser && currentUser.isAuthenticated) {
				var query = {
					entityTypes: ['com.apple.entity.SavedQuery'],
					query: {
						match: currentUser.guid,
						field: 'ownerGUID',
						exact: true
					},
					sortFields: ['-updateTime'],
					fields: ['type', 'longName', 'query']
				};
				return this.entitiesForSearchQuery(query, inCallback, inErrback);
			}
			return inCallback([]);
		}.bind(this), inErrback);
	},
	// Quick search keyword/type search.
	entitiesForQuickSearch: function(inKeyword, inTypes, inCallback, inErrback) {
		if (!inTypes) inTypes = ['com.apple.entity.File', 'com.apple.entity.Page'];
		var aQuery = this.searchQuery(inKeyword, inTypes, 0, 5);
		this.searchQueryUpdateSort(aQuery, '-rank');
		this.entitiesForSearchQuery(aQuery, inCallback, inErrback);
	},
	// Returns an array of entities matching a query.
	entitiesForSearchQuery: function(inQuery, inCallback, inErrback) {
		return this.entitiesForSearchQueryWithOptions(inQuery, undefined, inCallback, inErrback);
	},
	entitiesForSearchQueryWithOptions: function(inQuery, inOptions, inCallback, inErrback) {
		var _callback = function(response) {
			return this._defaultSearchResultsCallback(response, inCallback, inErrback);
		}.bind(this);
		return service_client().executeAsynchronously('SearchService', 'query:', inQuery, (inOptions || {}), _callback, inErrback);
	},
	entitiesForSavedSearch: function(inSavedSearchGUID, inCallback, inErrback) {
		var _savedSearchCallback = function(response) {
			this.entitiesForSearchQuery(response.query, inCallback, inErrback);
		}.bind(this);
		return this.entityForGUID(inSavedSearchGUID, _savedSearchCallback, inErrback);
	},
	// Returns a JSON-format search query.
	searchQuery: function(inKeywords, inTypes, inStartIndex, inHowMany, inOptSearchGUID) {
		var queryNode = null;
		var keywords = [];
		if (inKeywords) keywords = Object.isArray(inKeywords) ? inKeywords: [inKeywords];
		if (keywords.length) {
			queryNode = {};
			var andNode = queryNode['and'] = [];
			$A(keywords).each(function(keyword) {
				if (keyword && keyword != "") {
					andNode.push({
						'match': keyword
					});
				}
			});
		}
		var entityTypes = [];
		if (inTypes) entityTypes = Object.isArray(inTypes) ? inTypes: [inTypes];
		return {
			'guid': inOptSearchGUID,
			'query': queryNode,
			'fields': this.mDefaultSearchFields,
			'subFields': this.mDefaultSubpropertyPaths,
			'sortFields': this.mDefaultSearchSortFields,
			'range': [(inStartIndex || 0), (inHowMany || this.mDefaultSearchHowMany)],
			'entityTypes': entityTypes,
			'onlyDeleted': false
		};
	},
	searchQueryForTags: function(inTags, inTypes, inStartIndex, inHowMany, inOptSearchGUID) {
    	var aQuery = this.searchQuery("", inTypes, inStartIndex, inHowMany, inOptSearchGUID);
    	return this.addTagsToQuery(aQuery, inTags);
	},
	addTagsToQuery: function(inTags, inQuery) {
		var tags = (inTags == undefined) ? [] : (Object.isArray(inTags) ? inTags: [inTags]);
		if (tags.length) {
			var andNode = ((inQuery.query ? inQuery.query['and'] : []) || []);
			$A(tags).each(function(tag) {
				if (tag && tag != "") {
					andNode.push({
						match: tag,
						field: 'tags',
						exact: true
					});
				}
			});
			if (!inQuery.query) inQuery.query = {};
			inQuery.query['and'] = andNode;
		}
		return inQuery;
	},
	searchQueryAddToOrNode: function(inQuery, inItem) {
		return this.searchQueryAddToTypedNode('or', inQuery, inItem);
	},
	searchQueryAddToAndNode: function(inQuery, inItem) {
		return this.searchQueryAddToTypedNode('and', inQuery, inItem);
	},
	searchQueryAddToTypedNode: function(inType, inQuery, inItem) {
		var types = ['or', 'and'];
		
		if (types.indexOf(inType) != -1) {
			var typedNode = ((inQuery.query ? inQuery.query[inType] : []) || []);
			var hasNodeAlready = false;
			if (inItem) {
				if (inItem.field) {
					for (var a = 0; a < typedNode.length; a++) {
						var node = typedNode[a];
						if (node.field && node.field == inItem.field && node.match == inItem.match) {
							hasNodeAlready = true;
						}
					}
				}
			
				if(!hasNodeAlready) {
					typedNode.push(inItem);
				}
			}
			
			if (!inQuery.query) inQuery.query = {};
			inQuery.query[inType] = typedNode;
			return inQuery;
		}
		else {
			return null;
		}
		
	},
	searchQueryCreateNode: function(inFieldName, inMatchValue, inExact) {
		var node = {
			match: inMatchValue,
			field: inFieldName,
			exact: (inExact == true)
		}
		return node;
	},
	searchQueryCreateOrArray: function(inArrayOfNodes) {
		var orNode = {
			or: []
		};
		
		if (inArrayOfNodes) {
			for (var i = 0; i < inArrayOfNodes.length; i++) {
				var node = inArrayOfNodes[i];
				orNode.or.push(node);
			}
		}
		return orNode;
	},
	searchQueryCreateAndArray: function(inArrayOfNodes) {
		var andNode = {
			and: []
		};
		
		if (inArrayOfNodes) {
			for (var i = 0; i < inArrayOfNodes.length; i++) {
				var node = inArrayOfNodes[i];
				andNode.and.push(node);
			}
		}
		return andNode;
	},
	searchQueryUpdateSort: function(inQuery, inSortField) {
		inQuery.sortFields = [inSortField];
		return inQuery;
	},
	searchQueryFavoritesOnly: function(inQuery, inFavoritesOnly) {
		var andNode, _andNode;
		var oldAndNode = (inQuery.query ? inQuery.query['and'] || [] : []);
		var markedExistingAndNode = false;
		for (var nodeIdx = 0; nodeIdx < oldAndNode.length; nodeIdx++) {
			if (!andNode) andNode = inQuery.query['and'] = [];
			_andNode = oldAndNode[nodeIdx];
			if (_andNode && _andNode.field == 'isFavorite') {
				andNode[nodeIdx] = {match: (inFavoritesOnly == true), field: 'isFavorite'};
				markedExistingAndNode = true;
			} else {
				andNode[nodeIdx] = _andNode;
			}
		}
		if (!markedExistingAndNode && inFavoritesOnly) {
			if (!andNode) andNode = [];
			andNode.push({match: true, field: 'isFavorite'});
		}
		if (andNode) {
			if (!inQuery.query) inQuery.query = {};
			inQuery.query['and'] = andNode;
		}
		return inQuery;
	},
	searchQueryUpdateContainerGUID: function(inQuery, inContainerGUID) {
		return this.__updateQueryForContainerOrOwnerGUID(inQuery, 'containerGUID', inContainerGUID);
	},
	searchQueryUpdateOwnerGUID: function(inQuery, inOwnerGUID) {
		return this.__updateQueryForContainerOrOwnerGUID(inQuery, 'ownerGUID', inOwnerGUID);
	},
	__updateQueryForContainerOrOwnerGUID: function(inQuery, inContainerOrOwnerKey, inContainerOrOwnerValue) {
		if (inContainerOrOwnerKey && inContainerOrOwnerValue) {
			// Expand out entityTypes to individual nodes in an OR clause.
			if (!inQuery.query) inQuery.query = {};
			if (!inQuery.query['and']) inQuery.query['and'] = [];
			var andNode = inQuery.query['and'];
			var orNode = [];
			var entityTypes = (inQuery.entityTypes || []);
			if (entityTypes.length) {
				for (var tdx = 0; tdx < entityTypes.length; tdx++) {
					orNode.push({match: entityTypes[tdx], field: 'type', exact: true});
				}
				andNode.push({'or': orNode});
			}
			delete inQuery.entityTypes;
			// Push the new container or owner key.
			andNode.push({match: inContainerOrOwnerValue, field: inContainerOrOwnerKey, exact: true});
		}
		return inQuery;	
	},
	// Fetches activity (for an optional user or container GUID) from a given start index.	Accepts an
	// optional inOptPaginationGUID argument that triggers use of a cached pagination result on the server.
	paginatedActivity: function(inOptUserGUID, inOptOwnerGUID, inOptContainerGUID, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, inOptPaginationOnlyFavorites, inOptPaginationOnlyUnread, inOptPaginationOnlyWatched, inOptPaginationStartTime, inCallback, inErrback) {
		var query = {
			type: 'com.apple.UserActivityQuery',
			userGUID: inOptUserGUID,
			startIndex: 0, // The outer pagination request will take care of moving the pagination window.
			resultsLimit: this.mDefaultActivityTotalResultLimit,
			containerGUID: inOptContainerGUID,
			ownerGUID: inOptOwnerGUID,
			subFields: this.mDefaultActivitySubFields,
			onlyFavorites: (inOptPaginationOnlyFavorites || false),
			onlyUnread: (inOptPaginationOnlyUnread || false),
			onlyWatched: (inOptPaginationOnlyWatched || true),
			startTime: inOptPaginationStartTime
		};
		var _callback = function(response) {
			return this._defaultPaginatedEntitiesCallback(response, inCallback, inErrback);
		}.bind(this);
		service_client().paginateAsynchronously('ContentService', 'userActivity:', query, {}, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, _callback, inErrback);
	},
	paginatedSearchQuery: function(inQuery, inOptPaginationGUID, inOptPaginationStartIndex, inOptPaginationHowMany, inCallback, inErrback) {
		var _callback = function(service_response) {
			if (service_response && service_response.response) {
				var paginated = new CC.EntityTypes.PaginatedResult(service_response.response);
				var searchResult = new CC.EntityTypes.SearchResult(paginated.results[0]);
				var models = this._parseSearchResultsAndStoreEntities(searchResult.results);
				return inCallback(models, paginated.startIndex, paginated.total, paginated.guid);
			}
			return inErrback(service_response);
		}.bind(this);
		return service_client().entitiesForSearchQuery(inQuery, _callback, inErrback);
	},
	// Favorites/unread support.
	addEntityToFavorites: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'addEntityToFavorites:', inGUID, {}, inCallback, inErrback);
	},
	removeEntityFromFavorites: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'removeEntityFromFavorites:', inGUID, {}, inCallback, inErrback);
	},
	markEntityAsRead: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'markEntityAsRead:', inGUID, {}, inCallback, inErrback);
	},
	markEntityAsUnread: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'markEntityAsUnread:', inGUID, {}, inCallback, inErrback);
	},
	markAllAsRead: function(inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'markAllEntitiesAsRead', [], {}, inCallback, inErrback);
	},
	// Watched support.
	watchEntity: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'addEntityToWatchlist:', inGUID, {}, inCallback, inErrback);
	},
	unwatchEntity: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'removeEntityFromWatchlist:', inGUID, {}, inCallback, inErrback);
	},
	// acls
	aclsForEntityGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'aclsForEntityGUID:', inGUID, {}, function(service_response) {
			var acls = service_response.response;
			inCallback(acls);
		}.bind(this), inErrback);
	},
	setACLsOnEntity: function(inACLs, inGUID, inCallback, inErrback) {
		if (!inACLs || inACLs.length == 0) return inErrback();
		return service_client().executeAsynchronously('ContentService', 'setACLs:forEntityGUID:', [inACLs, inGUID], {}, inCallback, inErrback);
	},
	accessToEntityWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'accessToEntityWithGUID:', inGUID, {}, function(service_response) {
			var access = service_response.response;
			inCallback(access);
		}, inErrback);
	},
	odRecordsMatching: function(inKeyword, inCallback, inErrback) {
		var _callback = function(service_response) {
			var response = service_response.response;
			var rawRecords = (response) ? response : [];
			var records = rawRecords.collect(function(aRawRecord) {
				var aRecord = {
					login: aRawRecord.login,
					externalID: aRawRecord.externalID,
					longName: aRawRecord.longName
				};
				return aRecord;
			});
			if (inCallback) inCallback(records);
		}.bind(this);
		return service_client().executeAsynchronously('ODService', 'odRecordsMatching:', inKeyword, {}, _callback, inErrback);
	},
	detailPageWithContainerAndPermissionForID: function(inID, inCallback, inErrback) {
		// gets a container and its detail page
		var options =  {'expandReferencedObjects': false, 'subpropertyPaths': this.mDefaultSubpropertyPaths};
		var _callback = function(aModel) {
			var anEntity = server_proxy()._parseAndStoreEntity(aModel);
			if (!anEntity) return inErrback({responses:[aModel]});
			// Fetch the detail page for this entity.
			var detailPageGUID = anEntity.detailPageGUID;
			server_proxy().entityForIDWithOptions(detailPageGUID, {}, function(detailPage) {
				// Next grab the permissions.
				server_proxy().accessToEntityWithGUID(anEntity.guid, function (inAccess) {
					inCallback(detailPage, anEntity, server_proxy()._accessForString(inAccess));
				}, inErrback);
			}, inErrback);
		}.bind(this);
		server_proxy().entityForIDWithOptions(inID, options, _callback, inErrback);
	},
	documentWithContainerAndPermissionForID: function(inID, inCallback, inErrback) {
		// gets a document and it's container
		var options =  {'expandReferencedObjects': false, 'subpropertyPaths': this.mDefaultSubpropertyPaths};
		var _callback = function(aModel) {
			var anEntity = server_proxy()._parseAndStoreEntity(aModel);
			if (!anEntity) return inErrback({responses:[aModel]});
			// Fetch the container for this entity.
			var containerGUID = anEntity.containerGUID;
			server_proxy().entityForIDWithOptions(containerGUID, {}, function(container) {
				// Next grab the permissions.
				server_proxy().accessToEntityWithGUID(container.guid, function (inAccess) {
					inCallback(anEntity, container, server_proxy()._accessForString(inAccess));
				}, inErrback);
			}, inErrback);
		}.bind(this);
		// document first
		server_proxy().entityForIDWithOptions(inID, options, _callback, inErrback);
	},
	serverHomepageDocument: function(inCallback, inErrback) {
		// grab the server home page document
		var _callback = function(document, permissions) {
			// get permissions
			var anEntity = server_proxy()._parseAndStoreEntity(document);
			if (!anEntity) return inErrback({responses:[document]});
			server_proxy().accessToEntityWithGUID(anEntity.guid, function (inAccess) {
					inCallback(document, server_proxy()._accessForString(inAccess));
				}, inErrback);
		}.bind(this);
		server_proxy().entityForIDWithOptions('serverhome', {}, _callback, inErrback);
	},
	permissionsForUser: function(inCallback, inErrback) {
		sessions().currentUserAsynchronously(function(currentUser) {
			var batch = [
				['ContentService', 'canICreateProjects'],
				['ContentService', 'amIAnAdmin']
			];
			return service_client().batchExecuteAsynchronously(batch, null, function(service_response) {
				if (service_response && service_response.responses) {
					var firstResponse = service_response.responses[0];
					var secondResponse = service_response.responses[1];
					var userPermissions = {
						isLoggedIn : currentUser.isAuthenticated,
						canCreateWikis : firstResponse.response,
						isAdmin : secondResponse.response
					}
					if (inCallback) return inCallback(userPermissions);
				}
				if (inErrback) return inErrback(service_response);
			}, inErrback);
		}, inErrback);
	},
	_accessForString: function(inString) {
		return {
			canRead : (inString == 'read') || (inString == 'write') || (inString == 'own'),
			canWrite : (inString == 'write') || (inString == 'own'),
			owns : (inString == 'own')
		};
	},
	preferredEmailAddressForUser: function(inCallback, inErrback) {
		sessions().currentUserAsynchronously(function(currentUser) {
			var callback = function(result) {
				var email = "";
				if (result.privateAttributes) {
					email = result.privateAttributes.preferredEmailAddress ? result.privateAttributes.preferredEmailAddress : result.privateAttributes.defaultDirectoryEmailAddress;
				}
				if (email == undefined) {
					email = "";
				}
				return inCallback(email);
			}
			return server_proxy().entityForGUID(currentUser.guid, callback, inErrback);
		}, inErrback);
	},
	tagsForEntityGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'tagsForEntityGUID:', [inGUID], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response.response || []);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	removeTagFromEntityWithGUID: function(inTag, inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'removeTag:fromEntityWithGUID:', [inTag, inGUID], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	allTags: function(inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'allTags', [], {}, function(service_response){
			if (service_response && service_response.response) {
				return inCallback(service_response.response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	allTagsOwnedByGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'allTagsOwnedByGUID:', [inGUID], {}, function(service_response){
			if (service_response && service_response.response) {
				return inCallback(service_response.response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	allTagsStartingWith: function(tagPrefix, inCallback) {
		return service_client().executeAsynchronously('ContentService', 'allTagsStartingWith:', tagPrefix, {}, function(service_response){
			if (service_response && service_response.response) {
				return inCallback(service_response.response);
			}
		}, function(){
			logger.error("Could not fetch all tags starting with " + tagPrefix);
		});
	},
	replaceTagWithTagInOwnerGUID: function(firstTag, secondTag, ownerGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'replaceTag:withTag:inOwnerGUID:', [firstTag, secondTag, ownerGUID], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	globallyReplaceTagWithTag: function(oldTag, newTag, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'globallyReplaceTag:WithTag:', [oldTag, newTag], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	deleteTagInOwnerGUID: function(inTag, ownerGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'deleteTag:inOwnerGUID:', [inTag, ownerGUID], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	globallyDeleteTag: function(inTag, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'globallyDeleteTag:', [inTag], {}, function(service_response){
			if (service_response && service_response.succeeded) {
				return inCallback(service_response);
			}
			return inErrback(service_response);
		}, inErrback);
	},
	// Search tracking support. Returns a GUID to record a search by. You should pass an identical
	// query to the one you're using to search by.
	recordQuery: function(inQuery, inCallback, inErrback) {
		return service_client().executeAsynchronously('SearchService', 'recordQuery:', inQuery, {}, function(service_response) {
			if (service_response && service_response.response) {
				if (inCallback) return inCallback(service_response.response);
			}
		}, (inErrback || Prototype.emptyFunction));
	},
	// Records a click on a specific result for a in-progress query.
	recordClickInResultsWithGUID: function(inRecordedQueryGUID, inIndex, inSnippets, inClickedEntityGUID /*, No callbacks */) {
		var args = [inRecordedQueryGUID, (inIndex != undefined ? inIndex : -1), (inSnippets || {}), inClickedEntityGUID]
		return service_client().executeAsynchronously('SearchService', 'recordClickInResultsWithGUID:atIndex:withSnippets:andEntityGUID:', args, {}, Prototype.emptyFunction, Prototype.emptyFunction);
	},
	// Returns an array of revisions for a given entity GUID.
	revisionsForGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'pastEntitiesForGUID:withChangeTypes:onlyFields:', [inGUID, ['create', 'edit', 'delete', 'undelete', 'restore'], []], {}, inCallback, inErrback);
	},
	pastEntityForGUIDAtRevision: function(inGUID, inRevision, inCallback, inErrback) {
		var _callback = function(service_response) {
			var result = service_response.response;
			if (result.dataGUID) {
				// we've got a file revision, fetch the file data of that revision
				var dataCallback = function(dataResponse) {
					result.mediaType = dataResponse.mediaType;
					result.contentType = dataResponse.contentType;
					result.isQuickLookable = dataResponse.isQuickLookable;
					result.iconGUID = dataResponse.iconGUID;
					result.thumbnailGUIDs = dataResponse.thumbnailGUIDs;
					result.previewGUIDs = dataResponse.previewGUIDs;
					
					var revision = entity_types().entityForHash(result);
					inCallback(revision);
				}
				server_proxy().entityForGUID(result.dataGUID, dataCallback, function(response) {logger.error("Error getting entity for revision");});
			} else {
				var revision = entity_types().entityForHash(result);
				inCallback(revision);
			}
		}
		return service_client().executeAsynchronously('ContentService', 'pastEntityForGUID:atRevision:', [inGUID, inRevision], {}, _callback, inErrback);
	},
	pastEntitiesForGUIDAndRevisionsWithChangeTypesOnlyFields: function(inGUID, inRevisions, inChangeTypes, inOnlyFields, inCallback, inErrback) {
		var changeTypes = (inChangeTypes || []);
		var onlyFields = (inOnlyFields || []);
		return service_client().executeAsynchronously('ContentService', 'pastEntitiesForGUID:andRevisions:withChangeTypes:onlyFields:', [inGUID, (inRevisions || []), changeTypes, onlyFields], {}, inCallback, inErrback);
	},
	revisionSummaryForGUID: function(inGUID, inRevision, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'pastEntitiesForGUID:andRevisions:withChangeTypes:onlyFields:', [inGUID, [inRevision], ['create', 'edit', 'delete', 'undelete', 'restore'], ['revision', 'updatedByUserLongName', 'updatedByUserShortName', 'updateTime']], {}, inCallback, inErrback);
	},
	restoreRevision: function(inGUID, inRevision, inCallback, inErrback) {
		return service_client().executeAsynchronously('ContentService', 'restoreEntityWithGUID:toRevision:', [inGUID, inRevision], {}, inCallback, inErrback);
	},
	diffForEntityBetweenRevisions: function(inGUID, inFirstRevision, inSecondRevision, inCallback, inErrback) {
		var callback = function(service_response) {
			var result = service_response.response;
			inCallback(result);
		}
		return service_client().executeAsynchronously('ContentService', 'diffPastEntityGUID:compareRevision:againstRevision:usingProperty:', [inGUID, inFirstRevision, inSecondRevision, 'extendedAttributes.renderedPage'], {}, callback, inErrback);
	},
	// authentication 
	validateUsernameAndPassword: function(inUsername, inPassword, inRemember, inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('AuthService', 'validateUsername:andPassword:remember:', [inUsername, inPassword, inRemember], {}, callback, inErrback);
	},
	getChallenge: function(inUsername, inAdvanced, inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('AuthService', 'challengeForUsername:advanced:', [inUsername, inAdvanced], {}, callback, inErrback);
	},
	validateUsernameAndPasswordDigest: function(inDigest, inRemember, inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		service_client().executeAsynchronously('AuthService', 'validateUsernameAndPasswordDigest:remember:', [inDigest, inRemember], {}, callback, inErrback);
	},
	amILoggedIn: function(inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('ContentService', 'amILoggedIn', [], {}, callback, inErrback);
	},
	sanitizeRedirect: function(inRedirect, inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('AuthService', 'sanitizeRedirect:withHost:', [inRedirect, window.location.hostname], {}, callback, inErrback);
	},
	changePassword: function(inOldPassword, inNewPassword, inVerifiedPassword, inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('AuthService', 'changePasswordFrom:to:verified:', [inOldPassword, inNewPassword, inVerifiedPassword], {}, callback, inErrback);
	},
	currentServerTime: function(inCallback, inErrback) {
		var callback = function(inResponse) {
			inCallback(inResponse.response);
		}
		return service_client().executeAsynchronously('TimeService', 'currentServerTime', [], {}, callback, inErrback);
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.






// Sessions global responsible for tracking all things session related, including session cookies
// and session instances returned from the server. Important note: the session is not magically loaded
// when the page is loaded to avoid blocking the UI and to avoid race conditions where the session
// is loaded after dependent code is called. Any code that is expecting a populated session/user should
// be making calls to currentUserAsynchronously and currentOrNewSessionAsynchronously before drawing
// any dependent UI.

CC.now = function() {
	return Math.round(new Date().getTime() / 1000);
};

CC.Sessions = Class.createWithSharedInstance('sessions');
CC.Sessions.prototype = {
	mCurrentSession: null,
	mTimestamp: null,
	mRefreshInterval: 8 * 60 * 60,
	initialize: function() {},
	// Fetches a full session instance given the current session cookie, accepting an optional force
	// reset flag which nukes the local cookie and obtains a new session.
	currentOrNewSessionAsynchronously: function(inShouldReset, inCallback, inErrback) {
		var sessionGUID;
		if (!inShouldReset) {
			var currentSession = this.__getCurrentSession();
			if (currentSession) {
				logger().debug("currentOrNewSessionAsynchronously: %@", currentSession);
				var timestamp = CC.now();
				if ((timestamp - this.mTimestamp) < this.mRefreshInterval) {
					inCallback(currentSession);
					return;
				}
			}
			// Do we have a session cookie we can use?
			sessionGUID = this.currentSessionCookie();
		} else {
			// Nuke the current session (including the cookie) to force the server to grant us a new one.
			this.__resetCurrentSession();
		}
		// Fetch a session.
		service_client().executeAsynchronously('AuthService', 'currentOrNewSession', [], {}, function(service_response) {
			var session = (service_response && service_response.response);
			if (session) {
				logger().debug("session: " + JSON.stringify(session));
				this.__setCurrentSession(session);
				if (inCallback) inCallback(session);
				return;
			}
		}.bind(this), inErrback);
	},
	currentUserAsynchronously: function(inCallback, inErrback) {
		currentOrNewSessionAsynchronously(false, function(session) {
			return inCallback(session.user);
		}, function() {
			logger().error("Could not fetch current user");
			return inErrback();
		});
	},
	// Returns the current session cookie if it exists.
	currentSessionCookie: function() {
		return globalCookieManager().getCookie('cc.collabd_session_guid');
	},
	// Returns the current session.  You should not normally call this manually, use currentOrNewSessionAsynchronously.
	__getCurrentSession: function() {
		logger().debug("currentSession: %@", this.mCurrentSession);
		return this.mCurrentSession;
	},
	// Sets the current session. You should not normally call this manually.
	__setCurrentSession: function(inSession) {
		this.mTimestamp = CC.now();
		var sessionModel = new CC.EntityTypes.Session(inSession);
		logger().debug("__setCurrentSession: %@", sessionModel);
		globalCookieManager().setCookie('cc.collabd_session_guid', sessionModel.guid);
		return (this.mCurrentSession = sessionModel);
	},
	// Resets the current session (logging the current user out if they're authenticated). You should not normally
	// call this method manually.
	__resetCurrentSession: function(inOptCallback, inOptErrback) {
		logger().debug("__resetCurrentSession: %@");
		this.mCurrentSession = null;
		this.mTimestamp = null;
		globalCookieManager().destroyCookie('cc.collabd_session_guid');
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

function invalidate() {
	return false;
}

function alphabeticalSort(a, b) {
	var aUp = a.toUpperCase(), bUp = b.toUpperCase();
	for (i = 0; i < aUp.length; i++) {
		if (aUp[i] < bUp[i]) {
			return -1;
		}
		if (aUp[i] > bUp[i]) {
			return 1;
		}
	}
	return 0;
}
;
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.Mvc = CC.Mvc || new Object();
CC.Mvc.Mixins = CC.Mvc.Mixins || new Object();
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.EntityMixins = CC.EntityMixins || new Object();

// Container with comments mixin, e.g. a project or a blog.

CC.EntityMixins.COMMENT_ACCESS_DISABLED = 'disabled';
CC.EntityMixins.COMMENT_ACCESS_ALL = 'all';
CC.EntityMixins.COMMENT_ACCESS_AUTHENTICATED = 'authenticated';
CC.EntityMixins.COMMENT_ACCESS_DEFAULT = CC.EntityMixins.COMMENT_ACCESS_AUTHENTICATED;
CC.EntityMixins.COMMENT_ACCESS_ALLOWED_VALUES = [
	CC.EntityMixins.COMMENT_ACCESS_DISABLED,
	CC.EntityMixins.COMMENT_ACCESS_ALL,
	CC.EntityMixins.COMMENT_ACCESS_AUTHENTICATED
];

CC.EntityMixins.COMMENT_MODERATION_DISABLED = 'disabled';
CC.EntityMixins.COMMENT_MODERATION_ALL = 'all';
CC.EntityMixins.COMMENT_MODERATION_ANONYMOUS = 'anonymous';
CC.EntityMixins.COMMENT_MODERATION_DEFAULT = CC.EntityMixins.COMMENT_MODERATION_DISABLED;
CC.EntityMixins.COMMENT_MODERATION_ALLOWED_VALUES = [
	CC.EntityMixins.COMMENT_MODERATION_DISABLED,
	CC.EntityMixins.COMMENT_MODERATION_ALL,
	CC.EntityMixins.COMMENT_MODERATION_ANONYMOUS
];

CC.EntityMixins.ContainerWithComments = {
	getCommentAccessLevel: function() {
		var xattrs = (this.extendedAttributes || {});
		var settings = (xattrs['settings'] || {});
		return settings['comments'];
	},
	setCommentAccessLevel: function(inLevel) {
		if (CC.EntityMixins.COMMENT_ACCESS_ALLOWED_VALUES.include(inLevel)) {
			if (!this.extendedAttributes) this.extendedAttributes = {};
			if (!this.extendedAttributes.settings) this.extendedAttributes.settings = {};
			this.extendedAttributes.settings.comments = inLevel;
		}
		return false;
	},
	getCommentModerationLevel: function() {
		var xattrs = (this.extendedAttributes || {});
		var settings = (xattrs['settings'] || {});
		return settings['commentModeration'];
	},
	setCommentModerationLevel: function(inLevel) {
		if (CC.EntityMixins.COMMENT_MODERATION_ALLOWED_VALUES.include(inLevel)) {
			if (!this.extendedAttributes) this.extendedAttributes = {};
			if (!this.extendedAttributes.settings) this.extendedAttributes.settings = {};
			this.extendedAttributes.settings.commentModeration = inLevel;
		}
		return false;
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Base model class.

CC.Mvc.Model = Class.create(CC.Object, {
	// Walk like a model.
	isModel: true,
	// The type of this model.
	type: 'com.apple.Model',
	// A unique identifer for this model.
	guid: null,
	// Serializes this model to a JSON hash.
	serialize: function() {
		return {'type': this.type, 'guid': this.guid};
	}
});

// Mixin for a change-aware model; one that we can build changesets for.

CC.Mvc.Mixins.ChangeAware = {
	// Walk like a channge-aware duck.
	isChangeAware: true,
	// An array of attributes of this model to be considered when
	// building a changeset.
	mChangesetAttributes: [],
	// Private function returning a list of changeset attributes.
	// Do not override.
	_changesetAttributes: 'guid type'.w(),
	_cachedChangesetAttributes: null,
	changesetAttributes: function(inOptForceRecalculate) {
		if (!this._cachedChangesetAttributes || inOptForceRecalculate) {
			this._cachedChangesetAttributes = this.mChangesetAttributes ? this._changesetAttributes.concat(this.mChangesetAttributes) : this._changesetAttributes;
		}
		return this._cachedChangesetAttributes;
	},
	// Override serialize to return a simple object representation of this model
	// including changeset-aware attributes.
	serialize: function($super) {
		var serialized = new Object(), attrs = this.changesetAttributes(), attr;
		for (var attrIdx = 0; attrIdx < attrs.length; attrIdx++) {
			attr = attrs[attrIdx];
			serialized[attr] = this[attr];
		}
		serialized['type'] = this.type;
		serialized['guid'] = this.guid;
		return serialized;
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.





CC.EntityTypes = CC.EntityTypes || new Object();

// Sessions (read-only).

CC.EntityTypes.Session = Class.create(CC.Mvc.Model, {
	type: 'com.apple.Session',
	user: null,
	authToken: null,
	createTime: null,
	updateTime: null,
	data: null
});

CC.EntityTypes.DateTime = Class.create(CC.Mvc.Model, {
	type: 'com.apple.DateTime',
	epochValue: 0,
	isoValue:"",
	initialize: function(inDate) {
		// given the string, get epoch
		this.isoValue = inDate.toISOString();
		this.epochValue = inDate.getTime() / 1000;
	}
});

// Entity (changeset-aware).

CC.EntityTypes.BaseEntity = Class.create(CC.Mvc.Model, CC.Mvc.Mixins.ChangeAware, {
	_type: 'com.apple.Entity',
	mChangesetAttributes: [],
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.type = this._type;
		if (!this.guid) {
			var generator = new CC.GuidBuilder();
			this.guid = generator.toString();
		}
	}
});

CC.EntityTypes.WikiEntity = Class.create(CC.EntityTypes.BaseEntity, CC.EntityMixins.ContainerWithComments, {
	_type: 'com.apple.entity.Wiki',
	mChangesetAttributes: 'description extendedAttributes longName themeInfo detailPageGUID blogGUID'.w()
});

CC.EntityTypes.UserEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.User',
	mChangesetAttributes: 'privateAttributes extendedAttributes longName themeInfo detailPageGUID blogGUID preferredEmailHash'.w()
});

CC.EntityTypes.BlogEntity = Class.create(CC.EntityTypes.BaseEntity, CC.EntityMixins.ContainerWithComments, {
	_type: 'com.apple.entity.Blog',
	mChangesetAttributes: 'extendedAttributes longName'.w()
});

CC.EntityTypes.PageEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.Page',
	mChangesetAttributes: 'extendedAttributes longName'.w()
});

CC.EntityTypes.FileEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.File',
	mChangesetAttributes: 'extendedAttributes longName'.w()
});

CC.EntityTypes.FileDataEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.FileData'
});

CC.EntityTypes.EntityACL = Class.create(CC.Mvc.Model, {
	_type: 'com.apple.EntityACL',
	allow: true,
	action: 'none',
	userExternalID: null,
	userLogin: null,
	userLongName: null,
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.type = this._type;
	}
});

// Activity (read-only).

CC.EntityTypes.UserActivity = Class.create(CC.Mvc.Model, {
	type: 'com.apple.UserActivity',
	// Synthesize a guid property so we can stash activity objects in the store.
	guid: null,
	// Model attributes.
	userGUID: null,
	action: null,
	entityGUID: null,
	entityRevision: null,
	data: null,
	actionTime: null,
	containerGUID: null,
	ownerGUID: null,
	subFields: null,
	isUnread: null,
	isFavorite: null,
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		// Synthesize a guid for this model by hashing the userGUID, entityGUID, action and actionTime together.
		this.guid = "%@-%@-%@-%@".fmt(this.userGUID, this.entityGUID, this.action, (this.actionTime.getTime() / 1000));
	}
});

// Search.

CC.EntityTypes.SearchResult = Class.create(CC.Mvc.Model, {
	type: 'com.apple.SearchResult',
	guid: null,
	results: []
});

CC.EntityTypes.SavedQuery = Class.create(CC.Mvc.Model, {
	_type: 'com.apple.entity.SavedQuery',
	guid: null,
	longName: "Untitled Search",
	query: {},
	initialize: function($super) {
		this.type = 'com.apple.entity.SavedQuery',
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

// Related entity.

CC.EntityTypes.RelatedRelationship = Class.create(CC.Mvc.Model, {
	type: 'com.apple.relationship.Related',
	guid: null,
	targetEntityGUID: null,
	sourceEntityGUID: null
});

// Entity changeset.

CC.EntityTypes.EntityChangeSet = Class.create(CC.Object, {
	changeGUID: null,
	changeAction: null,
	changeType: null,
	entityGUID: null,
	entityRevision: null,
	entityType: null,
	changeComment: null,
	changeUserGUID: null,
	changeUserLogin: null,
	force: false,
	changes: null,
	initialize: function($super) {
		this.type = "com.apple.EntityChangeSet";
		this.changes = [];
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

// Service request/response classes.

CC.EntityTypes.ServiceRequest = Class.create(CC.Object, {
	adminAuthorizationRef: null,
	sessionGUID: null,
	serviceName: null,
	methodName: null,
	arguments: null,
	expandReferencedObjects: null,
	subpropertyPaths: null,
	referencedPathsToFollow: null,
	clientURL: undefined,
	hints: null,
	initialize: function($super) {
		this.type = "com.apple.ServiceRequest";
		this.arguments = [];
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

CC.EntityTypes.ServiceResponse = Class.create(CC.Object, {
	succeeded: false,
	response: null,
	responseStatus: null,
	referencedObjects: null
});

CC.EntityTypes.BatchServiceRequest = Class.create(CC.Object, {
	requests: null,
	initialize: function($super) {
		this.type = "com.apple.BatchServiceRequest";
		this.requests = [];
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

CC.EntityTypes.BatchServiceResponse = Class.create(CC.Object, {
	responses: null
});

CC.EntityTypes.PaginationRequest = Class.create(CC.Object, {
	serviceRequest: null,
	guid: null,
	startIndex: null,
	resultsLimit: null,
	initialize: function($super) {
		this.type = "com.apple.PaginationRequest"
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

CC.EntityTypes.PaginatedResult = Class.create(CC.Object, {
	guid: null,
	startIndex: null,
	results: null,
	total: null,
	initialize: function($super) {
		this.type = "com.apple.PaginatedResult",
		this.results = [];
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
	}
});

// Xcode Server support.

CC.EntityTypes.SCMRepositoryGroup = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.SCMRepositoryGroup',
	mChangesetAttributes: 'isDefault'.w()
});

CC.EntityTypes.BotGroup = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.BotGroup',
	mChangesetAttributes: 'isDefault'.w()
});

CC.EntityTypes.BotEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.Bot',
	mChangesetAttributes: 'latestRunSCMCommits latestRunStatus latestRunSubStatus latestSuccessfulBotRunGUID latestFailedBotRunGUID notifyCommitterOnSuccess notifyCommitterOnFailure'.w()
});

CC.EntityTypes.BotRunEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.BotRun',
	mChangesetAttributes: 'status subStatus buildOutputGUID xcsbuilddOutputGUID archiveGUID productGUID scmOutputLogMap xcodeResultBundlePlistGUID xcodeTestSummariesPlistGUID startTime endTime integration scmCommitGUIDs xcsbuilddOutputGUID scmCommitHistoryPlistGUID productsPruned logsPruned'.w()
});

CC.EntityTypes.SCMCommitEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.SCMCommit',
	mChangesetAttributes: 'scmType scmURI commitID authorName authorEmail message time'.w()
});

CC.EntityTypes.ADCTeamEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.ADCTeam',
	mChangesetAttributes: 'adcTeamID adcTeamName adcTeamStatus adcTeamJoinStatus adcTeamEnabledPrograms adcTeamIdentityCertificateCredentialGUID' .w()
});

CC.EntityTypes.ADCDeviceEntity = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.entity.ADCDevice',
	mChangesetAttributes: 'adcDeviceName adcDeviceModel adcDeviceModelCode adcDeviceModelUTI adcDeviceSoftwareVersion adcDeviceECID adcDeviceUDID adcDeviceSerialNumber adcDeviceTeamIDs adcDeviceUseForDevelopment adcDeviceLocation adcDeviceIsConnected adcDeviceIsSupported' .w()
});

CC.EntityTypes.XCWorkSchedule = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.XCWorkSchedule',
	mChangesetAttributes: 'guid entityGUID isEnabled workQueueName workData recurrences scheduleType'.w()
});

CC.EntityTypes.XCWorkScheduleRecurrence = Class.create(CC.EntityTypes.BaseEntity, {
	_type: 'com.apple.XCWorkScheduleRecurrence',
	mChangesetAttributes: 'guid scheduleGUID startTime repeatInterval'.w()
});

// Entity types global.

CC.EntityTypes.SharedInstance = Class.createWithSharedInstance('entity_types');
CC.EntityTypes.SharedInstance.prototype = {
	initialize: function() {},
	typeMap: {
		'com.apple.entity.Wiki': CC.EntityTypes.WikiEntity,
		'com.apple.entity.Page': CC.EntityTypes.PageEntity,
		'com.apple.entity.User': CC.EntityTypes.UserEntity,
		'com.apple.entity.Blog': CC.EntityTypes.BlogEntity,
		'com.apple.entity.File': CC.EntityTypes.FileEntity,
		'com.apple.entity.FileData': CC.EntityTypes.FileDataEntity,
		'com.apple.entity.EntityACL': CC.EntityTypes.EntityACL,
		'com.apple.UserActivity': CC.EntityTypes.UserActivity,
		'com.apple.SearchResult': CC.EntityTypes.SearchResult,
		'com.apple.entity.SavedQuery': CC.EntityTypes.SavedQuery,
		'com.apple.RelatedRelationship': CC.EntityTypes.RelatedRelationship,
		'com.apple.entity.Bot': CC.EntityTypes.BotEntity,
		'com.apple.entity.BotRun': CC.EntityTypes.BotRunEntity,
		'com.apple.entity.SCMCommit': CC.EntityTypes.SCMCommitEntity,
		'com.apple.XCWorkSchedule': CC.EntityTypes.XCWorkSchedule,
		'com.apple.XCWorkScheduleRecurrence': CC.EntityTypes.XCWorkScheduleRecurrence
	},
	prototypeForTypeName: function(inName) {
	    var val = this.typeMap[inName];
	    if (!val) val = CC.EntityTypes.BaseEntity;
		return val;
	},
	entityForHash: function(inHash) {
		var proto = this.prototypeForTypeName(inHash['type']);
		return new proto(inHash);
	}
};

// Returns a localized container string.  E.g. in Andrew's Documents, in Example Wiki.

var localizedContainerString = function(inContainerName, inContainerType) {
	var localized = "";
	if (!inContainerName || !inContainerType) return localized;
	if (inContainerType == "com.apple.entity.User") {
		localized = "_General.Container.Subtitle.User".loc(inContainerName);
	} else if (inContainerType == "com.apple.entity.Blog") {
		localized = "_General.Container.Subtitle.Blog".loc(inContainerName);
	} else if (inContainerType == "com.apple.entity.Wiki") {
		localized = "_General.Container.Subtitle.Wiki".loc(inContainerName);
	}
	return localized;
};

// Returns an avatar icon for a given entity.  Accepts an optional inOptIgnoreAvatarsAndPreviews argument
// which when passed as true, always returns a generic XcsWebBase icon.  Accepts optional width and
// height parameters, and a HIDPI flag.

var iconURIForEntity = function(inEntity, inOptReturnGenericIconsOnly) {
	var sizeString = "32x32";
	var hidpi = document.body.hasClassName('hidpi');
	// Build the iconURI first using the size.
	var iconURI = (hidpi ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAEJGlDQ1BJQ0MgUHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbAtElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6%2BEdigjL7ZHu%2Fk72I796i9zRiSJPwG4VHX0Z%2BAxRzNRrtksUvwf7%2BGm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi%2B3YV8DGMiT4VVuG7oiZpGzrZJhcs%2FhL49xtzH%2FDy6bdfTsXYNY%2B5yluWO4D4neK%2FZUvok%2F17X0HPBLsF%2BvuUlhfwX4j%2FrSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9FwpwtN%2B2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD%2B0rbyoBc3SOjczohbyS1drbq6pQdqumllRC%2F0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn%2BtZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L%2BYGHNtd1FJitqPAR%2BhERCNOFi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY%2Fjx4SMshe9LaJRpTvHr3C%2FybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY%2F%2BhpqwSyv0I0%2FQMTRb7RMgBxNodTfSPqdraz%2FsDjzKBrv4zu2%2Ba2t0%2FHHzjd2Lbcc2sG7GtsL42K%2BxLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT%2FIPszSueHQqv6i%2FqluqF%2BoF9TfO2qEGTumJH0qfSv9KH0nfS%2F9TIp0Wboi%2FSRdlb6RLgU5u%2B%2B9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8%2FLI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQadBtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0%2FEx%2BIzAreevPhe%2BCawpgP1%2FpMTMDo64G0sTCXIM%2BKdOnFWRfQKdJvQzV1%2BBt8OokmrdtY2yhVX2a%2BqrykJfMq4Ml3VR4cVzTQVz%2BUoNne4vcKLoyS%2BgyKO6EHe%2B75Fdt0Mbe5bRIf%2FwjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq94uejSOQGkVM6sN%2F7HelL4t10t9F4gPdVzydEOx83Gv%2BuNxo7XyL%2FFtFl8z9ZAHF4bBsrEwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAhZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuMS4yIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaDwveG1wOkNyZWF0b3JUb29sPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KZRFk%2FgAABPtJREFUeAHtm0tLLEcUgGt0fBtfiFkIgWxEcJc%2FIS41geBOBRHJwk3wB0R3CtEsbiDZZJFN4N6d5he4uFwhv0CJq2yUQVB8P3K%2Bcs7Yt%2B%2F0dI0z1Xfa6YLqrq6qrnPOV%2BdUV2tP7vHx0USlnCRp%2Byaq3XP9mYx%2FLrkgOl75kpWPGRgAD6LAP3d3dzFdX97MJJAfHh5sRtbl5aU5Ojr6d21t7UeZh799QYgD0IVZKHR8fPxyC2PuxHjS%2Ff29zci7vb01vb29X29ubr6Tpm99QYgDENduFfdxAApecHFxYdbX171BiDOQEPgobW9vf3RdzwtCIBgKeMH19bX1wPn5eS8Q4gBY%2B1gLn9ZDY1paWuppc2ksDGdsziorn8%2FbkLi5uTEHBwdma2ur7hCcAJS0lIIqF6yrR5lxMV4zY1IGAmBOTk5Md3e32djYeDcxMbEs%2Ff%2BQ9pqfDk4AUEAN13M9jA6PEYRAW2trq30qAOHq6soCICzm5uZ%2BbW9vb5P%2Bv9cKwQlAUFGfAJCjEFQO6wIACIOOjg7T399vPWN2dvaX4eHhfum3WQuEqgH4WgOCkHF9MkkB4AGAIFNHmpyc%2FEnWBaC9GEJDAsA49gR4gWauSW1tbewPFFAOCKurqyfS70VrghMAlNCUhAcgC5lsiFgHkBmUK%2FFv%2Bvr6bB%2B6LiwsvCneUzUEJwAMrgoEYVDvM2E8M49sBaHy8IShoSHT1dVlTk9Pc0tLS28kTO5Evz%2BrWROcAajhKOI7afwjB3nEPRBmZmbsFlnDgTo8YWxszIyPj%2BcWFxd%2FOzw8LIiuzu8OVQNQT0gCAiAUQGdnp%2Bnp6TFnZ2fWK2jjycD%2BoFAomP39fbOzs5NbWVl5K7p95wohDsAn78rqCb4BML66vkIYGBiwQNgek3gakIFBPj8%2FN3t7e7np6em%2FpPl7FwhxAKyg4CFJD1DYxDtuT7wjn8UxaDz6KYTR0VE2Tfmpqamfd3d330vTf0H9w2VnAKpMEmsASmKwysQ4NkEYz3pAm%2B4F6Eu7ngHAblHC5Sup%2B1JyfQBYCXJQpfTa1xlD1TDKyAWAeoO2BeVTNzIyYgGwYyTJfe1yupe2p42ErX0%2BOHuAun5SAFARWWQMQz7eF4z5ZzOeS4ODgxYAj8hiAkDkS5MzAB1teXlZi97PQTdHmM66nsspIHsCGyI8Houp4vt71QD4C01SSWcfeTrzYdlhGOwSqWPBLCa2sc9bWa0tnp0BaAiE7vd%2BqSFXSX7YU6pRyhlANYMm3bcSHNElcvbR0xmAzkTSxvmWV3GB8C28EcbPADTCLHxOHZzXgKS2wEnDyEIgaeKfQd4nr%2FRBHZxD4LU%2BBpseQE1rgHw4EPSmUjmqng6V2koDFAsufV36hMcNXtcEoEVeVculqHr6VmoLj%2BXS16VPeNzgdU0AggOltey8BsS8cKTV%2FuxlKAsBV999rfuApveApgfg%2FBTIQsB1sUhZv6YPgQxAyjy27uo6L4KvdSuchUDdfSplA2YekLIJq7u6mQfEIC3%2FR7%2BYm9LUnHlAmmbLh65N7wHOO8HsddiH%2FzXAmHEh8BqeAk8%2FL4mAHRcC9tt4cf8fIu5PQ3XF7%2FvjAECvIPmD5C8kx3mMdGmIhOfy42t0x4ZIL4gDcCk3MxhfR9K3%2FD8DpaHBEjrza28%2BkSVHAsiFv7SUzqUkro%2FBzDo5Lcar%2FkCwsy82Ui6b%2FgejIxFkpVwBMAAAAABJRU5ErkJggg%3D%3D" : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEJGlDQ1BJQ0MgUHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbAtElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6%2BEdigjL7ZHu%2Fk72I796i9zRiSJPwG4VHX0Z%2BAxRzNRrtksUvwf7%2BGm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi%2B3YV8DGMiT4VVuG7oiZpGzrZJhcs%2FhL49xtzH%2FDy6bdfTsXYNY%2B5yluWO4D4neK%2FZUvok%2F17X0HPBLsF%2BvuUlhfwX4j%2FrSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9FwpwtN%2B2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD%2B0rbyoBc3SOjczohbyS1drbq6pQdqumllRC%2F0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn%2BtZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L%2BYGHNtd1FJitqPAR%2BhERCNOFi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY%2Fjx4SMshe9LaJRpTvHr3C%2FybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY%2F%2BhpqwSyv0I0%2FQMTRb7RMgBxNodTfSPqdraz%2FsDjzKBrv4zu2%2Ba2t0%2FHHzjd2Lbcc2sG7GtsL42K%2BxLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT%2FIPszSueHQqv6i%2FqluqF%2BoF9TfO2qEGTumJH0qfSv9KH0nfS%2F9TIp0Wboi%2FSRdlb6RLgU5u%2B%2B9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8%2FLI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQadBtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0%2FEx%2BIzAreevPhe%2BCawpgP1%2FpMTMDo64G0sTCXIM%2BKdOnFWRfQKdJvQzV1%2BBt8OokmrdtY2yhVX2a%2BqrykJfMq4Ml3VR4cVzTQVz%2BUoNne4vcKLoyS%2BgyKO6EHe%2B75Fdt0Mbe5bRIf%2FwjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq94uejSOQGkVM6sN%2F7HelL4t10t9F4gPdVzydEOx83Gv%2BuNxo7XyL%2FFtFl8z9ZAHF4bBsrEwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAhZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuMS4yIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaDwveG1wOkNyZWF0b3JUb29sPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KZRFk%2FgAAAu9JREFUWAntls2KGkEQx3vGL2QX9eCu60XIniIeVXIRWZAkT2BIwBcI2Zt3Dwp6ySEvkENI2EPIAxjyCuq%2BQC4SFnLwoC6uy%2FqV%2BssW9Mx0jyNOIIf00lvV011Vv67qHsfYbDZCboZhPKXxM%2BpB%2Bbmbns1mj1Op1OT29vZ7v9%2F%2FTT6tTl2MHUEymczLwWDwQbaR%2FRGgPCUwt1gsxM3NzbLb7f6Kx%2BPvaE3XK4QDgIxDiNButy2BdAOGi0ajwfPz8yfVavXrbDZ7S36uaG6ts%2BPnJiuyxC5N0%2FTUA4GAQL%2B%2FvxfD4VCk0%2BnjTqfzqVwuv5Z96nQlAIKzYy8yGAwKdECMRiNRKBTMVqv1%2BeLi4g1txlozG4kSYL1ebwHglAFknZ9B4jmAIdHoLAgqhygWi2az2fxSqVRe2WJahkoAOQNyYOj2zhC8bjqdiru7OxEKhUQ%2BnzcbjcaVWyYchxB4yFo4HLaQehngQKIM9XpdRCKRrY%2BzszOzVqt9JNAl%2Bf1mvx1KAATDjvZpCI6guJKAmM%2FnW%2Fnw8AA30Vwu977X612T%2FlP2u7MEcr136YA%2BOjoSyWRSnJ6eipOTExGLxcRyuRSlUilNGXguB4fu2CZfv8vLy%2B1a7IwbSoOxTmId5nGIWd8q9G88Hocmk4mjrg4ANqCXCasHSQCtViuRSCTgx%2FFiUgJgh%2Bh%2BNPaFW6Fqfx0AQRliLwAcOF1bU1pNnzKkzAACu5UAPzGGuV%2BJcLhVTQnA101lgGcb%2BgsEvAPgVug2pARAEJ3Bdo52v08F3MqpBEBwXcoAEKTN71kBmCmbujCPSxnCIaXsA5a7%2BUglr4fOXUWgzQCnTSdVzvCMLw%2Fb8TqG4jFLJQAm3c4AG3uV8uvcbqME0NHajb2O%2BbdBtV55BvzcPYKiHDqfygzASGeAOT%2BbMgN%2BBtjl6z%2FAv5cBOnyLXXU7YH5ltzXsLwkCyNOiF9Sj9sUHjudk%2F4Pi9WQ%2FKgCUBV8jfpcH34MrArB8F%2F4BRR%2FZL6X2Z2MAAAAASUVORK5CYII%3D");
	if (inEntity.type == "com.apple.entity.Wiki" || inEntity.type == "com.apple.entity.User") {
		// Do we have a direct avatar? Otherwise fall back on a default.
		if (inEntity.avatarGUID && !inOptReturnGenericIconsOnly) {
			return "%@/files/download/%@".fmt(env().root_path, inEntity.avatarGUID);
		} else if (inEntity.type == "com.apple.entity.User") {
			iconURI = (hidpi ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw%2FeHBhY2tldCBiZWdpbj0i77u%2FIiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8%2BIDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowNjgwMTE3NDA3MjA2ODExOTEwOUMxNTRGRUY0NjcyNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1MDFBNUZDRkExRDgxMUUxQjQwRkZDNzE2NDQyNTBGRiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1MDFBNUZDRUExRDgxMUUxQjQwRkZDNzE2NDQyNTBGRiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI%2BIDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkYyODI0NDA5MDkyMDY4MTE5MkIwQjc0MTFDQjUxRDBCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjA2ODAxMTc0MDcyMDY4MTE5MTA5QzE1NEZFRjQ2NzI3Ii8%2BIDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY%2BIDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8%2BA8p5mQAACipJREFUeNrsW2tMVEcUHh4u74egsCiC%2BIgoiCKKggZKTUWNKdhSKX%2BMTfRHSWyi7U9D26R%2FTJqokWgbTZs0GkJKAkajKYmSNoBYSjQKikGE4gMEeSMrCmzPN9zZXlbYvTu7y9KUk0w2ex8z55w5j%2B%2Bcey9jczRH%2F2tys3cCo9FofRE3N3%2F6CaDhTcOXhjsNH9X6mMRAY5zGMI3XNAZp7iENc9vFv6dTtDrBVTCNhTQCjx8%2FHr9t27a4iIiImPnz5690d3f3DAgIiKXL3BUljg8ODjaOj4%2BP9vb2NrW3t7dUVlY20Pl6Oj1Ao4tGn1GLtmeawJMYRDoaUSRcSlFR0dHnz5%2BXv337FjspRbgXc2AuzIm5sYbZmq5XgCJ4dHp6%2Bgd37949%2F%2BbNmx6jgwlzYm6sgbWEIlweA4gWLycqLS3dv2bNmjwPDw9f8wuIefb06VM%2ByNTZyMgIe%2FnypWkH4TELFixgXl5ejHaaRUZG8qHT6d5ZbGxsbPj%2B%2FftFe%2Ffu%2FaWZiA49c5UCIGg4mefe7Ozsr7y9vSPUJ1%2B9esVaWlpYW1sbF9zHx4cPT09PRjHgHeGgJIoBbHR0lBkMBj6ghKioKBYTE8P8%2FPwmXf%2F69ev2srKy7%2FPy8krpbyeWnEkFhNGmx167du3zlStXfqo%2B0dPTw27fvs2F9%2FX1NQkuQ0IRw8PDXAmJiYksJCRk0jVkBL9mZmYW0m%2BjoginK2BxVlZWwoULF074%2B%2FuvUu0Iq6mpYY8fP%2BZmjOFIgutgQBEpKSmMLM50bmho6OHBgwe%2FLC4uvmOrS3jYyMeS%2FPz85HPnzv1Iu7tUHITQV65c4b69cOFC7suOJhEfuru7uYUFBQUxSqn8HLnTgj179mRQCr1bW1s7pKROhytgMYQ%2FefLkeWIG%2BZ37bHV1Nbt37x4LDg7mDCKgOXPAnebNmwfT5xaBOIHjFFsCdhCRgupICVDAoCMVEJabm5t09uzZH4TwlKNZeXk56%2Bzs5BEcwW2mCGshKHZ0dPAAu3TpUkbZB8Nn%2B%2FbtaY8ePaptaGjo1xIYtcQAP71en9jU1HRe%2BDyEv3r1Kg9QwgxdRWT23Cp2797NLUPEBArOB0lBt60pwV3L7hMs%2FUIID7PHziPoISI72%2BStDfAAXsATeAOBV%2FAM3q0JZ00BkRcvXvyQUt4n4kBVVRX3PVfvvJrAC3gCb4LAM3iHDLIuoFu7dm0qBZRi8vswEe2R6uDzsgSABNdBxgDoEREeaQ24YSr0p5WALrds2cKWLVvG%2F9ManZs2bcqlIF0NrGVrNRhBKG%2B%2FEB4Mk1nxaC9DEHZgYICFh4czUiyjuAJT5ecQzKjoYa2trfwaHFfnea2E%2B8DjokWL%2BP3gHTLEx8e30Om%2FbbEAHRUd6devXy8T2L6iooJ1dXXZrAAETJgncD8i9b59%2ByxeDyu7efMmF0AGTPX19XEskpGRYaodKDNk%2F040lRVMZwH6U6dO5QjhAW%2BB6aFZW4kiMktISGBUKGm6HuYLJQNYwTVsBVWIB0%2BePOGAKTQ0FEr3hSzr169%2FSKfbtARBNzLPqLi4uFxxAMhLZjcgPKK0VuEF4Z7U1FRuOTIEXu%2FcuWP6D1kg01QWP5UCQk6fPr2FwEaQwODwzcDAQJtTFBRAmpcSYsWKFRzuIsXZui4UAJ6FAiELZIJsWhQQunXr1h2qaosLbyuR73HEBn%2BUJdo5aSuA8ggRmv6TTLsgmzUFuJH2QonpZHVQMq%2FFtSpAJpJPCkSUKWABUs0KSqkoyQWRTEmQzdwNzBXgd%2BzYsVXC%2FGHCSEsyuRm7L7t7ggBtZdte4Bm8QwbhBpANMlpSQGBaWlqC%2BIP8LLuL6Pog96PTI0sC2soSeIcMghTZAi0pwIuASpT4g7yPNCSL02EFQH32FDr2rI97IYMgRTYvSwrwoYBnanTAhESFJUMAPoC%2BsgRQY8%2F6uBcymMx7QjYfS0DIiwLeInUbSjQ5ZOt2QGhZQiCFK8muDwWo4xAFRr01C%2FBAZ0Xd58MuyhKamejqylJ0dDSfwx4LVLsgKcTfvAk0lQL81a1q7ICrCALY8%2FADvKMWUc3na00BDiWYYH9%2Fv%2FT98F97Wm1QnrUNND87jupJ3YnFJLJRGGkIPUNZevHiBW93ya4v8IAqpkC2MUsKGCWT6XeUAoAg0bSUJdyLOWTXB%2B9qBRAusaqAEUpbz9UNBtG1kSHsHlzg8uXLNt976dIljuLsgdPgXTRdlG4UZBuxpAAD%2BV2r%2BIO6HJPY07RE%2BwyAxhZUJ7pHuNeetTGPuoGjyGawaAHkd22qAsKuPK7GA2pA4uzgZxKGeFf3LxXZLFrAYE1NTb0jqjFzV2hvb9d8%2FbNnz6QfqKoJvEdE%2FPvQWpFt0JIChgoKCh6Q6fASCgEIPqTOpbIdmgcPHmhOXU1NTZN8V4bAM%2FgXpTxkgmyQ0ZICjAQdu6mA%2BFMcwGMne%2FC8gNQIZlpADWIF8IMoY%2B1pv%2BNJsqDu7u6%2FiI8eNvFClkUg1F1VVXVN9YCBR3LZQCT6%2Fzt37tSE6YH%2Bdu3axSEsdlF2XfAM3gXdunXrN8impSXWc%2Fjw4Rpiul%2BkQuB5W4KYeUs8KSnJJkiNALhhwwZ%2Br0w%2FAfeBZ%2BFGkOXo0aN4ONKrRQHGjo6OtoaGhmJxYN26ddwktWofBQxQHBhBRxhuJNMUxb0wZcyFObWuj3XRihdE8aekubm51RwEMTb943FDS0uLIS8v72PauXmIyMjl4knsdKUrrAQNCPTmsesbN27kqVSmnIXFIIXFxsby%2Fj56A8gOAt1NNyd4DAsL4%2FcJ%2BHvgwIECUkD9VAqwxFl0fX3913FxcZ%2BJnFpWVsZ79mp0huMQHH4On8PCMk1UrYGtsbGRd3sB09GtVjdMkPbwECcrK8vEI1nyz%2FHx8d8yGx%2BN8TrC%2FOEoeu11dXVcwwhSEByMoH0NM5%2Bp0hnWhlRJG8SDJtIs%2BEDhBcsTLqfl4ailbscYTThKwvWRBjMFNIbQ8EmYIhZLTk7mJm%2FvO7uy7gF3gGtgQwB6iFfTdWSx3xQWFv4xVfCzhWJI0z%2BJNzZJ%2B0ayBONsInI%2FIwU6zpsg8AzeHaFwHd7TpcxQYfyPEHhV3i3WOcrqgjdv3vw%2BpZem2S48eASvbOJtdYeSPj8%2F%2FyNnvAjtyBeqwSN4dVb8WXLo0KHs2WgJ4Am8gUdnB2E9pcf3KENUzhbhwQt4cubOmxNeEVutzg6uIiXar1Z4mlFChI3B1xxUJzTPtOBYE2srqU7HXEh6pJwbN258R8iry9mCYw2spaQ5PXM1KU0OwMBIqgXSCCoXOuuTGcyt%2BDpefnSbNd8MqT5g8lSicNKZM2cOwT%2BpjH0qKzTuxRyYC3Mqc3s68qMpp303SLVBoBKYQo4cObI8Jydns%2FqzOarkJr06hhecCdKOiM%2FmSkpKbp04cQLfBKGN1UvrDEyzzuxUgBmTPgoyU384af5xlUGp18WHk%2FhO0KBhbjZHczRH0vSPAAMA4Xg5ppn3EnYAAAAASUVORK5CYII%3D" : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw%2FeHBhY2tldCBiZWdpbj0i77u%2FIiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8%2BIDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowNjgwMTE3NDA3MjA2ODExOTEwOUMxNTRGRUY0NjcyNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3OTFGRTZFQUExRDcxMUUxQjQwRkZDNzE2NDQyNTBGRiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3OTFGRTZFOUExRDcxMUUxQjQwRkZDNzE2NDQyNTBGRiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI%2BIDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjA3ODAxMTc0MDcyMDY4MTE5MkIwQjc0MTFDQjUxRDBCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjA2ODAxMTc0MDcyMDY4MTE5MTA5QzE1NEZFRjQ2NzI3Ii8%2BIDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY%2BIDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8%2Bn3h5XAAABMlJREFUeNrUV0tIY2cUPsZEjYnGVKWmPqZGhIHxMWPRUkHrqhYKhVZcjisDYhdu2lKQroqL0pWLWkGoYJdWRVCo3WgVLXWhabQyDL5GEZ8kRhPjI3p7vp975fZ6b3qdGSg9cODn3v%2F%2FvnPP6z%2BX6D%2BWpHvud7C6WV2sFla7%2FDzGesMaZg1JkhQ1C2g1uc%2FD%2BmZnZ%2BfDpqam94uLi9%2B1WCypGRkZD%2FHy9PT02c3NzcXGxsYfQ0NDvyUlJT3jx%2FtsyO6reiiX9dHg4ODn0Wh0QzIp2Ds8PPwlzgKDH5GRJgpBUUtLy%2BPu7u5vsrKyKvAgEonQ2toabW9vi3U4HBYbXS4XOZ1OKiwspJKSErGGHB8fBzo6Or4eGBjwM9nWfXLgQU9Pzwc%2Bn%2B87q9XqAtH8%2FDxtbW1Reno62e124udCIfF4XGgsFqOzszMqKiqimpoaYRg%2FD%2Ff19X3R3t7%2BKxvxwowBhUz%2BYVtb2%2FccS9v6%2BjpNTU0Rx5syMzNNxe3k5AR5QQ0NDeT1euHqq97e3s%2FYiF94vZ0oCXP4q99pbW39FuTLy8vk9%2FspOzub0tLSTCcODE1JSaG5uTnhkbKyMhswFxcXDxk3xkYcGXngUSgU%2Bolj%2FmRzc5NmZ2eJ12Sz2f6xCaD4wvPzc2JAERJ4SGvk1dUV8oBqa2uJKwfrRbfb%2FZQN%2BEvPAx7O3I9AzllMk5OT4su15MFgUMS6sbGRPB6PiP3Ozg4tLCwIMhisCM7CMIQwNzcX756Ag40OKiWq9sBjJh7hJHsbB46OjkQSqYW9QwUFBeKLtHJ5eUkjIyPCG1C1IIlzcnJETrD3Nh0OxydsgJ%2FkbibCxolXDXKl1PAlcK9a4fbq6mrduCPmMAx7tOeABUxggwNc%2FDxTbYC7vr7%2BPSyQ9XrZzp1OlJ02JGqBdxAeo8QENkTmcqsNcOTl5YlmgyajdaHYaLHQ9fU1XVxcGBqApMM%2BPQEmsCEyl0NtgJ0t9CpxTk1NveNGKDyAzDcSJCFCoXcWmMCWveFVLjKlChjb6lSSKTk5WZcAHkBWGwkSDV4AoVaACWyZzKlwW%2B5zM8EDSCQjQbYnyhE9UQzgco5HlFgpMdcqynJpackQbGVlRezRO6vGlrniagNi3L9FinKnunWjVgGOclJcqRYkp1JBemeBCWz5rliXh5hbA6J7e3sBLPLz8w1LCYLbcHf37pyBZ3rVowgwgQ2RuaJqA0LT09O%2FY4HbC7eZnqDtogq4k%2BkaBhIkqtENCWwIX1Lz4DRsxTMzM6JklL4OYgAgASsrK6m8vFyXJBAICMVAglAo8wLKE%2B6vq6szbMWQ%2FYmJiR%2BwqKqqEi0VX3RwcCCMKS0tpebmZkNySEVFhdiDvThzeHgoPAYsYEJkjn0jDFzHC5jr%2BDqWxsfHJe5e0ssKD6nS2NiYwIIw9p%2FgUM%2BEd3oJTy2fcpYHpdcswAS2dkglg5HMx5fP5esiBxYwga2diinBUOrj2j1%2BVXJgyOQP9MZy%2Bpex%2FGPE7WXJcRYYwDL6LzD1Y4KfDC6fF2aJsXd0dPQrMz8mZuUt9In%2B%2Fv6O1dXVn7knPOfecEvIZfYcX8v3xI9dXV1PsRdnEhGb%2BTPSEwyJb7DiOk1T3yW4rfGbiLmVgSP0f5G%2FBRgADsafvSd8l9gAAAAASUVORK5CYII%3D");
		}
	}
	return iconURI;
};

var iconURIForEntityType = function(inEntityType) {
	var fakeEntity = {type: (inEntityType || 'com.apple.Entity')};
	return iconURIForEntity(fakeEntity, true);
};

var getOwnerGuidFromEntityParentGuids = function(inEntity, inLevel) {
	if ( inLevel && inLevel > 0) {
		return ((inEntity.parentGUIDs.length-(inLevel+1) > 0) ? inEntity.parentGUIDs[inEntity.parentGUIDs.length -(inLevel+1)] : '');
	}
	else {
		return inEntity.ownerGUID;
	}
}
;
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Base object controller class.

CC.Mvc.ObjectController = Class.create(CC.Object, {
	mStore: null,
	mRecord: null,
	mViewInstance: null,
	// Safe methods for getting and setting model properties on this record backing this
	// object controller. Any changes to the record go through the store.
	// Returns a property at a given path for the record managed by this controller.
	// Returns undefined where the property or record itself doesn't exist.
	getRecordPropertyForPath: function(inPropertyPath, inDefaultValue) {
		if (!inPropertyPath || !this.mRecord) return undefined;
		var property = CC.objectForPropertyPath(inPropertyPath, this.mRecord);
		return (property != undefined ? property : inDefaultValue);
	},
	// Updates the record backing this object controller with a new value for a given
	// property path. Returns true if the property was successfully updated, and false
	// otherwise.
	setRecordPropertyForPath: function(inPropertyPath, inValue) {
		if (!inPropertyPath || !this.mStore || !this.mRecord) return undefined;
		return this.mStore.pushChangeForObject(this.mRecord, inPropertyPath, inValue);
	},
	// Updates the record backing this object controller using a deferred callback.
	setRecordPropertyForPathUsingDeferred: function(inPropertyPath, inDeferredCallback) {
		if (!inPropertyPath || !this.mStore || !this.mRecord) return undefined;
		return this.mStore.pushChangeForObjectUsingDeferred(this.mRecord, inPropertyPath, inDeferredCallback);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

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
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Base view controller class.

CC.Mvc.ViewController = Class.create(CC.Object, {
	mViewInstance: null
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

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
			accessibility().setRootViewsAriaHidden(true, false);
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
			accessibility().setRootViewsAriaHidden(false, false);
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
	},
	addClassName: function(inElement, inClassName) {
		var elem = $(inElement);
		elem.addClassName(inClassName);
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
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



// Authenticator class for plain/digest authentication.
CC.Auth = {};
CC.Auth.LOGIN_STATUS_CHANGED_NOTIFICATION = 'LOGIN_STATUS_CHANGED';

var Authenticator = Class.createWithSharedInstance('authenticator');
Authenticator.prototype = {
	basePath: "/auth",
	csrf_token: null,
	loginFrame: null,
	currentErrorMessage: null,
	initialize: function() {
		this.rememberMe = false;
	},
	displayWindowedLoginPrompt: function(inOptCallback, inOptCancelback, inOptErrMessage) {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var x = Math.floor((width - 340) / 2) + (window.screenX || window.screenLeft);
		var y = Math.floor((height - 300) / 2) + (window.screenY || window.screenTop);
		var w = window.open("/auth?sendToken=no&windowed=yes", "authWindow", "width=340,height=300,left=" + x + ",top=" + y + ",resizable=no,scrollbars=no,dialog=yes,centerscreen=yes");
		if (w == null)
			return false;
		if (inOptCallback)
			w.completionCallback = inOptCallback;
		if (inOptCancelback)
			w.cancelCallback = inOptCancelback;
		if (inOptErrMessage)
			this.currentErrorMessage = inOptErrMessage;
		return true;
	},
	displayFramedLoginPrompt: function(inOptCallback, inOptCancelback, inOptErrMessage) {
		if (this.loginFrame)
			return false;
		
		this.loginFrame = document.createElement('iframe');
		this.loginFrame.className = 'authenticationFrame';
		this.loginFrame.src = "/auth?sendToken=no&framed=yes";
		
		if (inOptCallback)
			this.loginFrame.completionCallback = inOptCallback;
		if (inOptCancelback)
			this.loginFrame.cancelCallback = inOptCancelback;
		if (inOptErrMessage)
			this.currentErrorMessage = inOptErrMessage;
			
		this.loginFrame.addEventListener('load', function(inEvent){
			dialogManager().hide();
			inEvent.target.addClassName('ready');
		}, false);
		
		document.body.appendChild(this.loginFrame);
		
		dialogManager().showProgressMessage("_General.Loading".loc());
		
		return true;
	},
	getCurrentErrorMessage: function() {
		var msg = this.currentErrorMessage;
		this.currentErrorMessage = null;
		return msg;
	},
	completeWindowedLogin: function(inLoginWindow) {
		this.repopulateUserMetadata(function(){
			if (inLoginWindow)
				inLoginWindow.close();
			
			globalNotificationCenter().publish(CC.Auth.LOGIN_STATUS_CHANGED_NOTIFICATION, this);
		
			if (inLoginWindow && inLoginWindow.completionCallback)
				inLoginWindow.completionCallback.call(this);
			if (this.loginFrame && this.loginFrame.completionCallback)
				this.loginFrame.completionCallback.call(this);
			
			if (this.loginFrame)
			{
				this.loginFrame.parentNode.removeChild(this.loginFrame);
				this.loginFrame = null;
			}
		}.bind(this), function(){
			inLoginWindow.close();
			window.location.reload();
		});
	},
	cancelWindowedLogin: function(inLoginWindow) {
		if (inLoginWindow)
			inLoginWindow.close();
		
		if (inLoginWindow && inLoginWindow.cancelCallback)
			inLoginWindow.cancelCallback.call(this);
		if (this.loginFrame && this.loginFrame.cancelCallback)
			this.loginFrame.cancelCallback.call(this);
		
		if (this.loginFrame)
		{
			this.loginFrame.parentNode.removeChild(this.loginFrame);
			this.loginFrame = null;
		}
	},
	repopulateUserMetadata: function(inOptCallback, inOptErrback) {
		server_proxy().refreshMetaTags(inOptCallback, inOptErrback);
	},
	// Plain login.
	login_plain: function(inUsername, inPassword, inCallback, inErrback) {
		var callback = function(inWorked) {
			if (!inWorked) {
				inErrback(inWorked);
			} else {
				inCallback(inWorked);
			}
		}
		server_proxy().validateUsernameAndPassword(inUsername, inPassword, this.rememberMe, callback, inErrback);
	},
	// Digest login.
	login_digest: function(inUsername, inPassword, inCallback, inErrback) {
		var validateCallback = function(success) {
			if (success) {
				inCallback(success);
			} else {
				inErrback(success);
			}
		}
		var challengeCallback = function(challenge) {
			var digested = digestResponse(inUsername, inPassword, challenge);
			server_proxy().validateUsernameAndPasswordDigest(digested, this.rememberMe, validateCallback, inErrback);
		}
		server_proxy().getChallenge(inUsername, true, challengeCallback.bind(this), inErrback);
	},
	// Logout.
	logout: function() {
		var currentURL = window.location;
		window.location.href = "/auth/logout?redirect=" + currentURL;
	},
	setRememberMe: function(inRemember) {
		this.rememberMe = inRemember;
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.ItemWithTitleAndURL = Class.create(CC.Object, {
	mDisplayTitle: null,
	mTooltip: null,
	mURL: null
});

CC.BreadcrumbItem = Class.create(CC.ItemWithTitleAndURL, {
	
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.DID_UPDATE_PAGINATING_LIST_VIEW = "DID_UPDATE_PAGINATING_LIST_VIEW";

// Base classes for paginating list behavior.

CC.PaginatingListView = Class.create(CC.Mvc.View, {
	mIsPaginating: false,
	mFilterBarViewClass: 'CC.FilterBarView',
	mFilterBarView: null,
	mPlaceholderString: "_General.No.Results.Found".loc(),
	mFilterBarChangedDelay: 100,
	render: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM);
		var tabIndexList = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM_LIST);
		var elem = Builder.node('div', {'tabindex': tabIndex, 'role': 'navigation', 'aria-label': "_Accessibility.View.BotList".loc(), className: 'cc-paginating-list-view'}, [
			Builder.node('div', {className: 'cc-paginating-list-view-filters'}),
			Builder.node('div', {'tabindex': tabIndexList, 'role': 'navigation', 'aria-label': "_Accessibility.View.ListView".loc(), className: 'cc-paginating-list-view-content loading'}),
			Builder.node('div', {className: 'cc-paginating-list-view-placeholder'}, this.mPlaceholderString),
			Builder.node('div', {className: 'cc-paginating-list-view-pagination', style: 'display: none;'}, "_General.Load.More".loc())
		]);
		elem.down('.cc-paginating-list-view-pagination').observe('click', this.handlePaginationLinkClicked.bind(this));
		// Append a filter bar instance.
		var konstructor = CC.objectForPropertyPath(this.mFilterBarViewClass);
		this.mFilterBarView = new konstructor();
		this.mFilterBarView._render();
		elem.down('.cc-paginating-list-view-filters').appendChild(this.mFilterBarView.$());
		var boundFilterBarChanged = this.handleFilterBarChangedNotification.bind(this);
		globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_KEYWORD, boundFilterBarChanged, this.mFilterBarView);
		globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_FILTER, boundFilterBarChanged, this.mFilterBarView);
		globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_SORT_KEY, boundFilterBarChanged, this.mFilterBarView);
		globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_TAGS, boundFilterBarChanged, this.mFilterBarView);
		return elem;
	},
	reset: function() {
		this.setIsPaginating(false);
		delete this.mPaginationState;
		this.$().down('.cc-paginating-list-view-content').innerHTML = "";
		this.$().down('.cc-paginating-list-view-content').addClassName('loading');
		this.paginate();
	},
	// Sets the paginating state of this paginating list view based on the boolean value inIsPaginating
	// that is passed. Note that if we're thought to be paginating and a pagination event comes in, it
	// will be ignored.
	setIsPaginating: function(inIsPaginating) {
		this.mIsPaginating = (inIsPaginating != undefined ? inIsPaginating : false);
		var content = this.$().down('.cc-paginating-list-view-content'), link = this.$().down('.cc-paginating-list-view-pagination');
		if (this.mIsPaginating) {
			link.addClassName('loading');
		} else {
			content.removeClassName('loading');
			link.removeClassName('loading');
		}
	},
	showPaginationLink: function(inShouldBeVisible) {
		var paginationLink = this.$().down('.cc-paginating-list-view-pagination');
		if (inShouldBeVisible) {
			paginationLink.show();
		} else {
			paginationLink.hide();
		}
	},
	setIsEmpty: function(inIsEmpty) {
		if (inIsEmpty) {
			this.$().addClassName('empty');
		} else {
			this.$().removeClassName('empty');
		}
	},
	handlePaginationLinkClicked: function(inEvent) {
		if (this.mIsPaginating) return false;
		this._paginate();
	},
	// Handle changed notifications on the filter bar view. 
	handleFilterBarChangedNotification: function(inMessage, inObject, inOptExtras) {
		// Since multiple filter bar notifications may come in in quick succession, use a timeout here
		// so we don't lose successive paginations while the previous pagination is in progress.
		if (this.mFilterBarChangedTimer) clearTimeout(this.mFilterBarChangedTimer);
		this.mFilterBarChangedTimer = setTimeout(function() {
			this.reset();
		}.bind(this), this.mFilterBarChangedDelay);
	},
	// Private wrapper function for pagination. You should not normally override this method.
	_paginate: function(inOptForcePaginate) {
		if (this.mIsPaginating && !inOptForcePaginate) return;
		this.setIsPaginating(true);
		var paginationGUID = this.mPaginationState.guid;
		var startIndex = ((this.mPaginationState.startIndex == undefined) ? 0 : this.mPaginationState.startIndex) + this.mPaginationState.previousResults.length;
		return this.paginate(paginationGUID, startIndex);
	},
	// Loads more items from the server. This is indirectly called when the pagination link is clicked
	// You should override this method to call a method in server_proxy asynchronously. You should use the
	// default pagination callback method below in doing so (and you should unless you're doing something
	// really funky).
	paginate: function(inPaginationGUID, inStartIndex) { /* Interface */ },
	// Default pagination callback.
	defaultPaginationCallback: function(inResults, inStartIndex, inTotal, inPaginationGUID) {
		this.setIsPaginating(false);
		// Is the list empty?
		this.setIsEmpty((inStartIndex == undefined || inStartIndex <= 0) && (!inResults || inResults.length == 0));
		var hasMoreResults = ((inTotal - ((inStartIndex || 0) + inResults.length)) > 0);
		// Update the pagination state.
		this.mPaginationState = {
			'previousResults': inResults,
			'startIndex': inStartIndex,
			'total': inTotal,
			'guid': inPaginationGUID,
			'hasMoreResults': hasMoreResults
		};
		// Show the paginator if we have more activity to show, otherwise hide it.
		this.showPaginationLink(hasMoreResults);
		// Render the results we got.
		if (inResults) this.renderResults(inResults);
		// Trigger a notification once the pagination is done.
		globalNotificationCenter().publish(CC.DID_UPDATE_PAGINATING_LIST_VIEW, this);
	},
	defaultPaginationErrback: function() { /* Interface */ },
	// Prepares a set of results for rendering.  You might want to override this if you're doing
	// grouping or client-side manipulation of data.
	prepareResultsForRendering: function(inResults) { /* Interface */
		return inResults;
	},
	// Renders a set of pagination results and appends them to the DOM.  You should not normally
	// override this method.
	renderResults: function(inResults, inOptAppendAtTop) {
	    if (!inResults || inResults.length == 0) return false;
		var rootElement = this.$().down('.cc-paginating-list-view-content');
		if (!rootElement) return;
		var preparedResults = this.prepareResultsForRendering(inResults) || inResults;
		var result, renderedResult;
		for (var resultIdx = 0; resultIdx < preparedResults.length; resultIdx++) {
			result = preparedResults[resultIdx];
			if (result) {
				renderedResult = this.renderResultItem(result);
				if (inOptAppendAtTop) {
					Element.insert(rootElement, {'top': renderedResult});
				} else {
					rootElement.appendChild(renderedResult);
				}
			}
		}
		globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE);
	},
	// Returns a rendered DOM node for an individual pagination result item.  You should override this.
	renderResultItem: function(inResultItem) { /* Interface */ }
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.FILTER_BAR_DID_CHANGE_KEYWORD = "FILTER_BAR_DID_CHANGE_KEYWORD";
CC.FILTER_BAR_DID_CHANGE_FILTER = "FILTER_BAR_DID_CHANGE_FILTER";
CC.FILTER_BAR_DID_CHANGE_SORT_KEY = "FILTER_BAR_DID_CHANGE_SORT_KEY";

// Default filtering/sorting options.

CC.FILTER_BAR_ALLOWED_FILTERS = ['everything', 'unread', 'favorites'];
CC.FILTER_BAR_ALLOWED_SORT_KEYS = $H({
	'title': '-longName'
});

// Basic filter bar view.

CC.FilterBarView = Class.create(CC.Mvc.View, {
	mKeyword: null,
	mTags: [],
	mFilter: 'everything',
	// mSortKey is the query-compatible key.
	mSortKey: '+longName',
	// _mSortKey is the sort direction agnostic version of the sort key.
	_mSortKey: 'title',
	// Allow overriding the filters/sort keys used by this filter bar.
	mAllowedFilters: CC.FILTER_BAR_ALLOWED_FILTERS,
	mAllowedSortKeys: CC.FILTER_BAR_ALLOWED_SORT_KEYS,
	// Format strings (substituted with capitilized filter/sort keys at runtime).
	mFilterTitleFormatString: "_FilterBarView.Filters.%@.Title",
	mFilterTooltipFormatString: "_FilterBarView.Filters.%@.Tooltip",
	mSortKeyTitleFormatString: "_FilterBarView.SortKeys.%@.Title",
	mSortKeyTooltipFormatString: "_FilterBarView.SortKeys.%@.Tooltip",
	// Popup menu.
	mSortDirectionMenu: null,
	mFilterBarKeypressDelay: 500,
	initialize: function($super) {
		$super();
		this.mAllowedFilters = (this.mAllowedFilters || new Array());
		this.mAllowedSortKeys = (this.mAllowedSortKeys || new Hash());
	},
	render: function() {
		var filterTooltipFormat = this.mFilterTooltipFormatString;
		var filterTitleFormat = this.mFilterTitleFormatString;
		var sortTooltipFormat = this.mSortKeyTooltipFormatString;
		var sortTitleFormat = this.mSortKeyTitleFormatString;
		var currentCapitalizedSortKey = this._mSortKey.capitalizeFirstCharacter();
		var tabIndexFilterMain = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_FILTER_MAIN);
		var tabIndexFilterSortBy = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY);
		var tabIndexFilterSortByType = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_FILTER_SORT_BY_TYPE);
		var tabIndexFilterKeyWord = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_FILTER_KEYWORD);
						
		var elem = Builder.node('div', {className: 'cc-filter-bar-view'}, [
			Builder.node('div', {'role': 'presentation', className: 'section first'}, this.mAllowedFilters.collect(function(filter) {
				var capitalizedFilterName = filter.capitalizeFirstCharacter();
				var button = Builder.node('a', {'tabindex': tabIndexFilterMain++, className: 'button' + (filter == this.mFilter ? ' selected' : ''), name: filter, title: filterTooltipFormat.fmt(capitalizedFilterName).loc()}, filterTitleFormat.fmt(capitalizedFilterName).loc());
				Event.observe(button, 'click', this.handleFilterButtonClicked.bind(this));
				return button;
			}, this)),
			Builder.node('div', {'tabindex': '-1', className: 'section'}),
			Builder.node('div', {'tabindex': '-1', className: 'section last'}, [
				Builder.node('div', {className: 'cc-filter-bar-view-popup'}, [
					Builder.node('a', {'tabindex': tabIndexFilterSortBy, href: '#'}, "_FilterBarView.SortBy".loc()),
					Builder.node('span', {'tabindex': tabIndexFilterSortByType, className: 'cc-filter-bar-view-popup-selected', title: sortTooltipFormat.fmt(currentCapitalizedSortKey).loc()}, sortTitleFormat.fmt(currentCapitalizedSortKey).loc()),
					Builder.node('div', {className: 'cc-filter-bar-popup-menu', style: 'display: none;'}, [
						Builder.node('ul', {className: 'items'}, this.mAllowedSortKeys.collect(function(value, index) {
							var sortKey = value[0];
							var capitalizedSortKey = sortKey.capitalizeFirstCharacter();
							var listItem = Builder.node('li', [
								Builder.node('a', {'tabindex': tabIndexFilterSortByType, 'role': 'button', className: 'button' + (sortKey == this._mSortKey ? ' selected' : ''), name: sortKey, title: sortTooltipFormat.fmt(capitalizedSortKey).loc()}, sortTitleFormat.fmt(capitalizedSortKey).loc())
							]);
							Event.observe(listItem, 'click', this.handleSortOptionClicked.bind(this));
							return listItem;
						}, this))
					])
				]),
				Builder.node('div', {className: 'cc-filter-bar-view-keyword'}, [
					Builder.node('input', {'tabindex': tabIndexFilterKeyWord, 'id': 'filter_keyword', 'type': 'text', 'placeholder': "_FilterBarView.Filter".loc()})
				])
			])
		]);
		// Observe keyup events in the filter field.
		var filterInput = elem.down('.cc-filter-bar-view-keyword input');
		Event.observe(filterInput, 'keyup', this.handleFilterInputKeyUp.bind(this));
		// Initialize the sort popup menu if we have items, otherwise hide it.
		if (this.mAllowedSortKeys.keys().length <= 0) {
			elem.down('.cc-filter-bar-view-popup').hide();
		} else {
			this.mSortDirectionMenu = new CC.Menu(elem.down('.cc-filter-bar-popup-menu'), elem.down('.cc-filter-bar-view-popup-selected'));
		}
		return elem;
	},
	makeAccessible: function() {
		// Set Navigation landmark (Filter/Nav)
		this.mParentElement.writeAttribute('role', 'navigation');
		this.mParentElement.writeAttribute('aria-label', "_Accessibility.MenuBar.Filter".loc());
				
		var navigationItems = this.mParentElement.querySelectorAll("a");
		var sortBy = this.mParentElement.querySelector('span');
		var keywordInput = this.mParentElement.querySelector('#filter_keyword');
		sortBy.writeAttribute("role", "listbox");
		keywordInput.writeAttribute("role", "search");
		
		for (var i = 0; i < navigationItems.length; i++) {			
			navigationItems[i].writeAttribute("role", "link");
		}
		
	},
	handleFilterButtonClicked: function(inEvent) {
		var source = Event.findElement(inEvent, '.button');
		if (source) this.setFilter(source.getAttribute('name'));
	},
	handleSortOptionClicked: function(inEvent) {
		var item = Event.findElement(inEvent, 'a.button');
		if (item) this.setSortKey(item.getAttribute('name'));
	},
	handleFilterInputKeyUp: function(inEvent) {
		var keyword = Event.findElement(inEvent, 'input').getValue();
		if (this.mFilterInputKeyTimer) clearTimeout(this.mFilterInputKeyTimer);
		this.mFilterInputKeyTimer = setTimeout(function() {
			this.setKeyword(keyword);
		}.bind(this), this.mFilterBarKeypressDelay);
	},
	setKeyword: function(inKeyword) {
		this.mKeyword = inKeyword;
		globalNotificationCenter().publish(CC.FILTER_BAR_DID_CHANGE_KEYWORD, this, {keyword: this.mKeyword});
	},
	setFilter: function(inFilter) {
		if (!inFilter) return false;
		this.mFilter = inFilter;
		var buttons = this.$().select('.section.first .button'), button;
		for (var bdx = 0; bdx < buttons.length; bdx++) {
			button = buttons[bdx];
			if (button) {
				button.removeClassName('selected');
				if (button.getAttribute('name') == inFilter) {
					button.addClassName('selected');
				}
			}
		}
		globalNotificationCenter().publish(CC.FILTER_BAR_DID_CHANGE_FILTER, this, {filter: this.mFilter});
	},
	setSortKey: function(inSortKey) {
		if (!inSortKey) return false;
		this._mSortKey = inSortKey;
		this.mSortKey = this.mAllowedSortKeys.get(this._mSortKey);
		// Update the currently selected filter.
		var selected = this.$().down('.cc-filter-bar-view-popup-selected');
		var capitalizedSortKey = this._mSortKey.capitalizeFirstCharacter();
		selected.setAttribute('title', this.mSortKeyTooltipFormatString.fmt(capitalizedSortKey).loc());
		selected.innerHTML = this.mSortKeyTitleFormatString.fmt(capitalizedSortKey).loc();
		// Update the popup menu.
		if (this.mSortDirectionMenu) {
			var buttons = this.mSortDirectionMenu.menu.select('.items .button');
			buttons.invoke('removeClassName', 'selected');
			var foundButton = buttons.find(function(b) {
				return (b && b.getAttribute('name') == inSortKey);
			});
			if (foundButton) foundButton.addClassName('selected');
		}
		globalNotificationCenter().publish(CC.FILTER_BAR_DID_CHANGE_SORT_KEY, this, {sortKey: this._mSortKey});
	},
	setTags: function(inTags) {
		if (inTags == undefined) return false;
		this.mTags = inTags;
		globalNotificationCenter().publish(CC.FILTER_BAR_DID_CHANGE_TAGS, this, {tags: this.mTags});
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.




CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_FILTERS = ['everything', 'favorites'];
if (CC.meta('x-apple-user-is-admin') == "true") {
	CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_FILTERS.push('deleted');
}
CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_SORT_KEYS = $H({
	'title': 'longName',
	'mostRecent': '-lastActivityTime',
	'leastRecent': 'lastActivityTime'
});

CC.PaginatingSearchQueryListFilterBarView = Class.create(CC.FilterBarView, {
	mAllowedFilters: CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_FILTERS,
	mAllowedSortKeys: CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_SORT_KEYS
});

// A search-backed paginating list view base class.

CC.PaginatingSearchQueryListView = Class.create(CC.PaginatingListView, {
	mEntityTypes: ['com.apple.entity.Page', 'com.apple.entity.File'],
	mSearchFields: null,
	mSubFields: null,
	mRequestOptions: null,
	mOwnerGUID: null,
	mDefaultPaginationHowMany: 25,
	mStashedRecordedQuery: null,
	mRecordedQueryGUID: null,
	mFilterBarViewClass: 'CC.PaginatingSearchQueryListFilterBarView',
	buildQuery: function(inStartIndex, inHowMany) {
		var keyword = this.mFilterBarView.mKeyword;
		// Are we filtering by favorites only?
		var filter = this.mFilterBarView.mFilter;
		var favoritesOnly = (filter == 'favorites');
		var deletedOnly = (filter == 'deleted');
		// Grab the sort order of the filter bar.
		var sortOrder = this.mFilterBarView.mSortKey;
		// Grab the scope of the filter bar.
		var ownerGUID = this.mOwnerGUID;
		// Build a query to search with.
		var query = server_proxy().searchQuery((keyword ? [keyword] : []), this.mEntityTypes);
		var tags = this.mFilterBarView.mTags;
		if (tags && tags.length > 0) {
			query = server_proxy().addTagsToQuery(tags, query);
		}
		if (deletedOnly) {
			query.onlyDeleted = true;
		}
		// Update the query with favorite/sort settings.
		query = server_proxy().searchQueryFavoritesOnly(query, favoritesOnly);
		query = server_proxy().searchQueryUpdateSort(query, sortOrder);
		query = server_proxy().searchQueryUpdateOwnerGUID(query, ownerGUID);
		// Fake a start index (we use the query range here instead of the pagination API).
		var startIndex = (inStartIndex || query.range[0]);
		// Fake pagination by requesting n+1 items.  We'll throw away the last item later.
		// Set the query range.
		query.range = [startIndex, (inHowMany || this.mDefaultPaginationHowMany + 1)];
		// Does this view specify custom search/sub/sort fields for the search?
		if (this.mSearchFields) query.fields = this.mSearchFields;
		if (this.mSubFields) query.subFields = this.mSubFields;
		return query;
	},
	// Use a custom pagination method that actually adjusts the range of a search query instead
	// of the paginateQuery API.
	paginate: function(inPaginationGUID, inStartIndex) {
		var howMany = this.mDefaultPaginationHowMany + 1;
		var query = this.buildQuery(inStartIndex, howMany);
		// Stash the query so we can record it.
		this.mStashedRecordedQuery = CC.deepClone(query);
		// Paginate using a custom callback that fakes the pagination API.
		var _callback = function(inResponse) {
			var models = server_proxy()._parseSearchResultsAndStoreEntities(inResponse);
			var total = ((inStartIndex || 0) + models.length + 1);
			// Did we get less than a full window of items?  If we did, we don't need to continue paginating.
			if (models.length < howMany) total -= 1;
			// Otherwise, drop the last item.
			if (models.length == howMany) {
				models.pop();
			}
			return this.defaultPaginationCallback(models, (inStartIndex || 0), total);
		}.bind(this);
		server_proxy().entitiesForSearchQueryWithOptions(query, this.mRequestOptions, _callback, this.defaultPaginationErrback.bind(this));
	},
	// Override this function so we can fetch a recorded query GUID out-of-band.
	defaultPaginationCallback: function($super, inResults, inStartIndex, inTotal, inPaginationGUID) {
		$super(inResults, inStartIndex, inTotal, inPaginationGUID);
		// Once we've rendered the list, record the query if query recording is enabled.
		if (CC.meta('x-apple-config-RecordSearchStats') == "true") {
			server_proxy().recordQuery(this.mStashedRecordedQuery, function(guid) {
				this.mRecordedQueryGUID = guid;
				// Attach an event handler that will fire before the route.
				var results = $$('.cc-search-item-entity span.title:not(.cc-search-recording-enabled)');
				var boundHandler = this.handleRecordedSearchResultMouseDown.bind(this);
				results.each(function(result) {
					// Use mousedown to ensure the event handler fires before the default route handler.
					Event.observe(result, 'mousedown', boundHandler);
					result.addClassName('cc-search-recording-enabled');
				});
			}.bind(this), Prototype.emptyFunction);
		}
	},
	// Records a result.
	handleRecordedSearchResultMouseDown: function(inEvent) {
		var clickedResult = Event.findElement(inEvent, '.cc-search-item-entity');
		var clickedDataAttributes = clickedResult.getDataAttributes();
		var clickedGUID = clickedDataAttributes['guid'];
		var clickedSnippets = JSON.parse(clickedDataAttributes['snippets']);
		var allSearchResults = $$('.cc-search-item-entity');
		var index = allSearchResults.indexOf(clickedResult);
		server_proxy().recordClickInResultsWithGUID(this.mRecordedQueryGUID, index, clickedSnippets, clickedGUID);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



// Container paginating list view.

CC.PaginatingContainerListView = Class.create(CC.PaginatingSearchQueryListView, {
	// Default to displaying actual preview icons.
	mDisplayGenericPreviewIcons: false,
	renderResultItem: function(inResultItem) {
		if (!inResultItem) return;
		var isFavorite = (inResultItem.isFavorite || false);
		var entityTitle = (inResultItem.longName || inResultItem.shortName);
		var entityURL = CC.entityURL(inResultItem, true);
		var iconURI = iconURIForEntity(inResultItem, this.mDisplayGenericPreviewIcons);
		var description = inResultItem.description;
		var contentListItem = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_LIST_ITEMS);
		var rowItems = [
			Builder.node('a', {'href': '#', 'role': 'checkbox', 'aria-label': "_Accessibility.CheckboxFavorite".loc(), 'className': 'cc-entity-favorite-toggle' + (isFavorite ? ' selected' : ''), 'data-guid': inResultItem.guid, 'title': "_General.Favorite.Toggle.Title".loc()}),
			Builder.node('span', { 'role': 'presentation', 'className': 'modtime'}, "_General.LastActivity.Format".loc(globalLocalizationManager().localizedDateTime(inResultItem.lastActivityTime || inResultItem.createTime))),
			Builder.node('span', { 'role': 'presentation', 'className': 'cc-entity-icon', 'style': 'background-image: url(%@); background-size: 32px 32px;'.fmt(iconURI)}, [
				Builder.node('img', {'role': 'presentation', 'src': (iconURI || "")})
			]),
			Builder.node('span', {'role': 'presentation', 'className': 'title ellipsis'}, [
				Builder.node('a', {'role': 'link', 'href': entityURL}, entityTitle)
			])
		];
		if (description) {
			var infoButton = Builder.node('span', {'className': 'infoButton'});
			infoButton.addEventListener('click', function(event){
				if (infoButton.childElementCount == 0) {
					infoButton.appendChild(Builder.node('div', {'className': 'descriptionPopup'}, [
					Builder.node('h1', "_General.Container.Description".loc()),
					Builder.node('h2', description)
					]));
				} else {
					infoButton.removeChild(infoButton.children[0]);
				}
			}, false);
			rowItems.push(infoButton);
		}
		var elem = Builder.node('div', {className: 'cc-container-list-item'}, rowItems);
		// Enable the favorite toggle.
		elem.select('.cc-entity-favorite-toggle').each(function(toggle) {
			new CC.EntityFavoriteToggle(toggle);
		});
		return elem;
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// A disclosure view with an open/close triangle, title row and content view.

CC.DisclosureView = Class.create(CC.Mvc.View, {
	mClassName: 'cc-disclosure-view',
	// Is this disclosure view open or closed?
	mOpen: true,
	// The title row text we display.
	mTitleRowText: "",
	// The content view for this disclosure view.
	mContentView: null,
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		if (this.mContentView) {
			this.addSubview(this.mContentView, 'div.content', false);
		} else {
			logger().error("Content view is not specified for disclosure view, skipping addSubview call");
		}
	},
	render: function() {
		var randomString = buildRandomString();
		globalEventDelegate().registerDomResponderForEventByIdentifer('click', randomString, this.handleTitleClicked.bindAsEventListener(this));
		return Builder.node('div', {className: 'open'}, [
			Builder.node('div', {className: 'title', 'data-responder-id': randomString}, [
				Builder.node('span', {className: 'beforetitle'}),
				(this.mTitleRowText || "").loc(),
				Builder.node('span', {className: 'aftertitle'})
			]),
			Builder.node('div', {className: 'content selectable'})
		]);
	},
	setIsOpen: function(inShouldBeOpen) {
		if (inShouldBeOpen == this.mOpen) return;
		if (inShouldBeOpen == true) {
			this.mOpen = true;
			this.mParentElement.addClassName('open');
		} else {
			this.mOpen = false;
			this.mParentElement.removeClassName('open');
		}
	},
	handleTitleClicked: function(inEvent) {
		this.setIsOpen(!this.mOpen);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.EntityTitle = CC.EntityTitle || new Object();
CC.EntityTitle.NOTIFICATION_TITLE_SHOULD_UPDATE = 'ENTITY_TITLE_SHOULD_UPDATE';
CC.EntityTitle.NOTIFICATION_TITLE_DID_CHANGE = 'ENTITY_TITLE_DID_CHANGE';

// Base class for an editable page title view.  Used by the editor to display the page title,
// last modified information and a favorite star.  Also used to display standalone file titles.

CC.EntityTitle.EntityTitleView = Class.create(CC.Mvc.View, {
	// Should this title be editable or not?
	mEditable: false,
	// Renders the title view.
	render: function() {
		return Builder.node('div', {className: 'cc-entity-title chrome'}, [
			Builder.node('div', {className: 'title-container'}, [
				Builder.node('h1', {className: 'title-readonly'}),
				Builder.node('div', {className: 'title-edit'}, [
					Builder.node('input', {type: 'text'})
				]),
				Builder.node('h2'),
				Builder.node('a', {className: 'cc-entity-favorite-toggle'})
			])
		]);
	},
	// Watches for a page title changed notification and updates the title. Reverts to a
	// default placeholder where the title is undefined. It is assumed the notification
	// includes a store-compatible instance backed by a suitable record.
	updateDisplay: function(inMessage, inObject, inOptExtras) {
		// Update the page title.
		var title = (inObject && inObject.mRecord && inObject.getRecordPropertyForPath('longName'));
		var displayTitle = (!title || (title && title.isWhitespace())) ? "_EntityTitle.PageTitle.Untitled".loc() : title;
		var strippedTitle = displayTitle.strip();
		var entityURL = CC.entityURL(inObject.mRecord, true);
		var titleElement = this.$().down('h1.title-readonly');
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ENTITY_TITLE);
		titleElement.innerHTML = "";
		titleElement.appendChild(Builder.node('a', {'tabindex': tabIndex, 'href': '#', 'data-href': entityURL, 'title': displayTitle}, strippedTitle));
		// Update the favorite widget and last modified information.
		if (inObject && inObject.mRecord && inObject.mRecord.updatedByUser) {
			var entity = inObject.mRecord;
			var favoriteToggle = this.$().down('.cc-entity-favorite-toggle');
			favoriteToggle.setAttribute('data-guid', entity.guid);
			entity.isFavorite ? favoriteToggle.addClassName('selected') : favoriteToggle.removeClassName('selected');
			var updatedTimestamp = globalLocalizationManager().localizedDateTime(entity.updateTime);
			var updatedDisplayName, updatedShortName, updatedByURL, updatedMarkup;
			if (entity.updatedByUser.shortName == "unauthenticated") {
				updatedMarkup = "_EntityTitle.LastModified.Unauthenticated".loc();
			} else {
				updatedDisplayName = (entity.updatedByUser.longName || entity.updatedByUser.shortName).escapeHTML();
				updatedShortName = (entity.updatedByUser.shortName || "").escapeHTML();
				updatedByURL = CC.entityURL(entity.updatedByUser);
				updatedMarkup = "<a href='%@'>%@</a>".fmt(updatedByURL, updatedDisplayName);
			}
			this.$().down('h2').innerHTML = "_EntityTitle.LastModified".loc(updatedTimestamp, updatedMarkup);
		}
		globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE, undefined, {'rootElement': this.$()});
		return true;
	},
	updateTitle: function() {
		var elem = this.$();
		var updatedTitle = $F(elem.down('input'));
		if (this._cachedTitle != updatedTitle) {
			this._cachedTitle = updatedTitle;
			elem.down('h1.title-readonly a').innerHTML = this._cachedTitle.escapeHTML();
			globalNotificationCenter().publish(CC.EntityTitle.NOTIFICATION_TITLE_DID_CHANGE, this, {title: this._cachedTitle});
		}
	},
	registerEventHandlers: function() {
		var elem = this.mParentElement;
		bindEventListeners(this, [
			'handleDisplayTitleClick',
			'handleDisplayTitleFieldBlur',
			'handleDisplayTitleFieldKeyDown',
			'handleDisplayTitleFieldKeyUp'
		]);
		Event.observe(elem.down('h1.title-readonly'), 'click', this.handleDisplayTitleClick);
		Event.observe(elem.down('input'), 'blur', this.handleDisplayTitleFieldBlur);
		Event.observe(elem.down('input'), 'keydown', this.handleDisplayTitleFieldKeyDown);
		Event.observe(elem.down('input'), 'keyup', this.handleDisplayTitleFieldKeyUp);
		elem.select('.cc-entity-favorite-toggle').each(function(toggle) { new CC.EntityFavoriteToggle(toggle); });
		globalNotificationCenter().subscribe(CC.EntityTitle.NOTIFICATION_TITLE_SHOULD_UPDATE, this.updateDisplay.bind(this), this.mContent);
	},
	handleDisplayTitleClick: function(inEvent) {
		if (!this.mEditable) {
			// Grab the data-href from the source.
			var header = Event.findElement(inEvent, 'h1');
			var source = header.down('a');
			var dataHref = source.getAttribute('data-href');
			if (dataHref) {
				globalRouteHandler().routeURL(dataHref);
				return true;
			}
		};
		// Stop the event so we don't trigger the link.
		Event.stop(inEvent);
		var elem = this.$();
		elem.addClassName('editing');
		this._cachedTitle = elem.down('h1.title-readonly a').innerHTML.unescapeHTML();
		this.$().down('input').value = this._cachedTitle;
		this.$().down('input').activate();
	},
	handleDisplayTitleFieldBlur: function(inEvent) {
		this.updateTitle();
		this.$().removeClassName('editing');
	},
	handleDisplayTitleFieldKeyDown: function(inEvent) {
		inEvent.stopPropagation();
		var keyCode = inEvent.keyCode;
		if (keyCode == Event.KEY_RETURN) this.handleDisplayTitleFieldBlur(inEvent);
		if (keyCode == Event.KEY_TAB) this.handleDisplayTitleFieldTab(inEvent);
	},
	handleDisplayTitleFieldKeyUp: function(inEvent) {
		this.updateTitle();
	},
	handleDisplayTitleFieldTab: function(inEvent) {
		Event.stop(inEvent);
		this.updateTitle();
		globalNotificationCenter().publish(CC.Keyboard.NOTIFICATION_DID_KEYBOARD_TAB, this);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// An error view class.

CC.ErrorMessageView = Class.create(CC.Mvc.View, {
	mErrorMessage: "",
	render: function() {
		return Builder.node('div', {className: 'cc-error-message-view error'}, [
			Builder.node('p', this.mErrorMessage)
		]);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.Graphs = CC.XcodeServer.Graphs || new Object();

// Some graph style constants.

CC.XcodeServer.Graphs.GRAPH_TYPE_BAR_CHART = 'GRAPH_STYLE_BAR_CHART';
CC.XcodeServer.Graphs.GRAPH_TYPE_LINE_GRAPH = 'GRAPH_STYLE_LINE_GRAPH';

CC.XcodeServer.Graphs.GRAPH_DEFAULT_WIDTH = undefined; // Auto-calculated.
CC.XcodeServer.Graphs.GRAPH_DEFAULT_HEIGHT = 230;

CC.XcodeServer.Graphs.DEFAULT_OPTIONS = {
	showHorizontalAxis: true,
	showVerticalAxis: true,
	showSelection: true,
	showBaseline: true,
	showHorizontalLabels: true,
	showVerticalLabels: true
};

CC.XcodeServer.Graphs.DEFAULT_STYLE = {
	canvasLeftMargin: 0,
	canvasRightMargin: 0,
	canvasTopMargin: 0,
	canvasBottomMargin: 0,
	axis: {
		numberOfVerticalLabels: 6,
		widths: [2, 1], // First axis width is 2px, the others are 1px.
		colors: ["#000000", "#D7D7D7"], // First axis is darker than the others.
		verticalAxisLabelFont: "10px Helvetica",
		verticalAxisLabelOffset: 5,
		verticalAxisLabelColor: "#A2A2A2",
		verticalAxisLabelGutter: 15,
		verticalAxisLabelRightMargin: 4, // Right margin of the label text (included in gutter above)
		horizontalAxisLabelTopMargin: 5,
		horizontalAxisLabelHeight: 13,
		horizontalAxisLabelFont: "13px Helvetica",
		horizontalAxisLabelFontFourDigits: "10px Helvetica",
		horizontalAxisLabelFontFiveDigits: "9px Helvetica",
		horizontalAxisLabelColor: "#898989",
		horizontalDistanceBetweenPoints: 24
	},
	barchart: {
		backgroundColors: ["blue", "red"],
		borderColors: ["purple", "orange"],
		borderWidth: 1,
		barWidth: 12 // Width of the bar itself, sitting in the middle of the gap.
	},
	linegraph: {
		lineWidth: 2,
		lineColor: "#0E478C",
		pointsRadius: 1.5,
		gradientColors: ["#CFE8FC", "#FBFDFF"],
		selectionDotRadiuses: [2.5, 6, 8.5],
		selectionDotGradientColors: ["#93C1ED", "#2561AF"],
		selectionDotBorderColor: "#2164b0"
	},
	baseline: {
		textValue: "BASELINE",
		tokenFontSize: 11,
		tokenFont: "bold 11px Helvetica",
		tokenFontColor: "white",
		tokenFontShadowSpec: ["rgba(0,0,0,0.2)", 0, -1, 0],
		tokenPadding: {x: 9, y: 5},
		tokenBottomPaddingHack: 2,
		sideMargin: 10,
		tokenAndLineColor: "#91ADCA",
		baselineLineHeight: 2,
		baselineLineGradientColors: ["rgba(204,228,249,0)", "#91ADCA", "#91ADCA", "rgba(204,228,249,0)"],
		baselineLineGradientColorStops: [0, 0.5, 0.5, 1]
	}
};

CC.XcodeServer.Graphs.ISSUES_OPTIONS = CC.XcodeServer.Graphs.UNIT_TEST_OPTIONS = {
	showHorizontalAxis: true,
	showVerticalAxis: false,
	showSelection: false,
	showBaseline: false,
	showHorizontalLabels: true,
	showVerticalLabels: false
};

CC.XcodeServer.Graphs.ISSUES_STYLE = {
	canvasLeftMargin: 0,
	canvasRightMargin: 0,
	canvasTopMargin: 0,
	canvasBottomMargin: 0,
	axis: {
		widths: [1, 0],
		colors: ["#DBDBDB", "#DBDBDB"],
		horizontalAxisLabelTopMargin: 2,
		horizontalAxisLabelHeight: 12,
		horizontalAxisLabelFont: "12px Helvetica",
		horizontalAxisLabelColor: "#838383",
		horizontalDistanceBetweenPoints: 13
	},
	barchart: {
		backgroundColors: ["#F48F88", "#FEEB9B", "#9EBAED"],
		borderColors: ["#E11F01", "#F6C101", "#4360ED"],
		borderWidth: 1,
		barWidth: 14
	}
};

CC.XcodeServer.Graphs.UNIT_TEST_STYLE = {
	canvasLeftMargin: 0,
	canvasRightMargin: 0,
	canvasTopMargin: 0,
	canvasBottomMargin: 0,
	axis: {
		widths: [1, 0],
		colors: ["#DBDBDB", "#DBDBDB"],
		horizontalAxisLabelTopMargin: 2,
		horizontalAxisLabelHeight: 12,
		horizontalAxisLabelFont: "12px Helvetica",
		horizontalAxisLabelColor: "#838383",
		horizontalDistanceBetweenPoints: 13
	},
	barchart: {
		backgroundColors: ["#FF837F", "#6CE092"],
		borderColors: ["#F10000", "#00BA1B"],
		borderWidth: 1,
		barWidth: 14
	}
};

CC.XcodeServer.Graphs.TEST_RESULTS_NAVIGATION_OPTIONS = {
	showHorizontalAxis: false,
	showVerticalAxis: false,
	showSelection: false,
	showBaseline: false,
	showHorizontalLabels: false
};

CC.XcodeServer.Graphs.TEST_RESULTS_NAVIGATION_STYLE = {
	canvasLeftMargin: 0,
	canvasRightMargin: 0,
	canvasTopMargin: 0,
	canvasBottomMargin: 0,
	barchart: {
		backgroundColors: ["#cc3e27", "#2bb235"],
		borderColors: ["#F10000", "#00BA1B"],
		borderWidth: 0,
		barWidth: 1
	},
	axis: {
		verticalAxisLabelGutter: 0,
		verticalAxisLabelRightMargin: 0,
		horizontalAxisLabelTopMargin: 0,
		horizontalAxisLabelHeight: 0,
		horizontalDistanceBetweenPoints: 2
	}
};


CC.XcodeServer.Graphs.PERFORMANCE_TEST_STYLE = {
	barchart: {
		backgroundColors: ["#9FD98D", "#BED7E8", "#EB7479"],
		borderColors: ["#619F27", "#3365A4", "#F5212D"]
	}
};

// Graph rendering helpers.

CC.XcodeServer.Graphs.integralSizeForSize = function(inSize) {
	return ({w: Math.floor(inSize.w), h: Math.floor(inSize.h)});
};

CC.XcodeServer.Graphs.integralPointForPoint = function(inPoint) {
	return({x: Math.floor(inPoint.x), y: Math.floor(inPoint.y)});
};

// Draws a rectangle correctly aligned on pixel boundaries. If we're calling fill() we just need
// to round the origin and size to closest integar values. If we're calling stroke() we need to
// round origin and size to the nearst half value if the border width is odd, or the nearest integer
// value if the border width is even. Supports passing a corner radius for rounded corners.

CC.XcodeServer.Graphs.drawIntegralRect = function(inContext, inOrigin, inSize, inBackgroundColor, inBorderColor, inBorderWidth, inCornerRadius) {
	var ctx = inContext;
	var origin = CC.XcodeServer.Graphs.integralPointForPoint(inOrigin);
	var size = CC.XcodeServer.Graphs.integralSizeForSize(inSize);
	var shouldShiftByZeroDotFive = (inBorderWidth && ((inBorderWidth % 2) == 1));
	ctx.save();
	ctx.fillStyle = inBackgroundColor;
	ctx.strokeStyle = inBorderColor;
	ctx.lineWidth = inBorderWidth;
	if (shouldShiftByZeroDotFive) {
		ctx.translate(0.5, 0.5)
	}
	ctx.beginPath();
	var x = origin.x, y = origin.y, w = size.w, h = size.h;
	if (inCornerRadius) {
		ctx.moveTo((x + inCornerRadius), y);
		ctx.arcTo((x + w), y, (x + w), (y + inCornerRadius), inCornerRadius);
		ctx.arcTo((x + w), (y + h), (x + w - inCornerRadius), (y + h), inCornerRadius);
		ctx.arcTo(x, (y + h), x, (y + h - inCornerRadius), inCornerRadius);
		ctx.arcTo(x, y, (x + inCornerRadius), y, inCornerRadius);
	} else {
		ctx.rect(x, y, w, h);
	}
	ctx.closePath();
	ctx.fill();
	if (inBorderColor && inBorderWidth) {
		ctx.stroke();
	}
	ctx.restore();
};

CC.XcodeServer.Graphs.drawText = function(inContext, inText, inOrigin, inFontSize, inFontColor, inShadowSpec) {
	var origin = CC.XcodeServer.Graphs.integralPointForPoint(inOrigin);
	var ctx = inContext;
	ctx.save();
	ctx.font = (inFontSize || ctx.font);
	ctx.fillStyle = (inFontColor || ctx.fillStyle);
	if (inShadowSpec) {
		ctx.shadowColor = inShadowSpec[0];
		ctx.shadowOffsetX = inShadowSpec[1];
		ctx.shadowOffsetY = inShadowSpec[2];
		ctx.shadowBlur = inShadowSpec[3];
	}
	if (inText != inText) {
		inText = "";
	}
	ctx.fillText(inText, origin.x, origin.y);
	ctx.restore();
};

// Graph view class supporting line graphs with a baseline value and stacked bar charts.

CC.XcodeServer.GraphView = function(inData, inGraphType, inOptParentElement, inOptMinimumWidth, inOptHeight, inOptOptions, inOptStyle) {
	var elem = document.createElement('div');
	elem.className = "xc-graph-view";
	// Initialize a graph canvas.
	var canvas = document.createElement('canvas');
	elem.appendChild(canvas);
	this.mGraphCanvas = new CC.XcodeServer.GraphCanvas(inData, canvas, inGraphType, inOptMinimumWidth, inOptHeight, inOptOptions, inOptStyle);
	this.mParentElement = elem;
};

// Graph canvas class, one graph canvas per graph view.

CC.XcodeServer.GraphCanvas = function(inData, inCanvas, inGraphType, inMinimumWidth, inHeight, inOptions, inStyle, inRountMaxYToClosestUpTen) {
	// Set some configuration for our graph.
	this.mData = (inData.data || []);
	this.mMetaData = (inData.metadata || {});
	this.mCanvas = inCanvas;
	this.mGraphType = (inGraphType || CC.XcodeServer.Graphs.GRAPH_TYPE_LINE_GRAPH);
	this.mMinimumWidth = (inMinimumWidth || 0);
	this.mHeight = (inHeight || CC.XcodeServer.Graphs.GRAPH_DEFAULT_HEIGHT);
	// Override the default options and style with whatever was passed in.
	this.mOptions = this.mergeRecursive(this.deepClone(CC.XcodeServer.Graphs.DEFAULT_OPTIONS), (inOptions || {}));
	this.mStyle = this.mergeRecursive(this.deepClone(CC.XcodeServer.Graphs.DEFAULT_STYLE), (inStyle || {}));
	// Compute the minimum and maximum y-axis values we're about to plot.
	this.minY = 0;
	this.mData.forEach(function(record) {
		var valuesSum = record.values.reduce(function(a, b) { return a + b; });
		record.total = valuesSum;
		if (!this.maxY || valuesSum > this.maxY) {
			this.maxY = valuesSum;
		}
	}, this);

	if ( inRountMaxYToClosestUpTen === 'undefined' || inRountMaxYToClosestUpTen ) {
		// Round the maxY value up to the nearest 10.
		this.maxY = Math.ceil(this.maxY / 10) * 10;
	}
	// Draw partner!
	this.draw();
};

// Draws the graph (using a lot of conditional logic keyed off the graph type and style).

CC.XcodeServer.GraphCanvas.prototype = {
	/* Scale factor along the x-axis given an index */
	scaleX: function(inIndex) {
		var scaledValue = Math.round(inIndex * this.xScale);
		if (scaledValue < 0) scaledValue = 0;
		return scaledValue;
	},
	/* Scale factor along the y-axis given a value */
	scaleY: function(inValue) {
		var scaledValue = Math.round(inValue * this.yScale);
		if (scaledValue < 0) scaledValue = 0;
		return scaledValue;
	},
	ratioY: function(inValue) {
		var ratioValue = Math.round(inValue * this.yRatio);
		if (ratioValue < 0) ratioValue = 0;
		return ratioValue;
	},
	draw: function() {
		var ctx = this.mCanvas.getContext("2d");
		var scaleFactor = 1;
		if ('devicePixelRatio' in window) {
			scaleFactor = window.devicePixelRatio;
		}

		// Calculate a scale factor for the x-axis.  Note we use the same xScale for bar and line
		// graphs to be sure they line up when stacked on top of each other.
		this.xScale = this.mStyle.barchart.barWidth + this.mStyle.axis.horizontalDistanceBetweenPoints;

		var verticalAxisLabelGutter = this.mStyle.axis.verticalAxisLabelGutter;
		if (this.mOptions.showVerticalAxis == false) verticalAxisLabelGutter = 0;
		var verticalAxisLabelRightMargin = this.mStyle.axis.verticalAxisLabelRightMargin;
		if (this.mOptions.showVerticalAxis == false) verticalAxisLabelRightMargin = 0;
		var axisWidth = this.mStyle.axis.widths[0];
		var canvasContentWidth = this.scaleX(this.mData.length);
		var computedWidth = this.mStyle.canvasLeftMargin + verticalAxisLabelGutter + axisWidth + canvasContentWidth + this.mStyle.canvasRightMargin;

		var CANVAS_WIDTH = Math.floor(Math.max(computedWidth, this.mMinimumWidth));
		var CANVAS_HEIGHT = Math.floor(this.mHeight);
		this.mCanvas.width = CANVAS_WIDTH;
		this.mCanvas.height = CANVAS_HEIGHT;
		var CANVAS_CONTENT_WIDTH = (CANVAS_WIDTH - this.mStyle.canvasLeftMargin - this.mStyle.canvasRightMargin);
		if (this.mOptions.showVerticalAxis) CANVAS_CONTENT_WIDTH -= (axisWidth + verticalAxisLabelGutter);
		var CANVAS_CONTENT_HEIGHT = (CANVAS_HEIGHT - this.mStyle.canvasTopMargin - this.mStyle.canvasBottomMargin);
		if (this.mOptions.showHorizontalAxis) CANVAS_CONTENT_HEIGHT -= (axisWidth + this.mStyle.axis.horizontalAxisLabelTopMargin + this.mStyle.axis.horizontalAxisLabelHeight);

		// On Chrome, the devicePixelRatio and backingStorePixelRatio do not match, so we need to trigger a manual
		// upscale of the canvas by upsizing width/height by devicePixelRatio / webkitBackingStorePixelRatio and then
		// using CSS to scale it back down to the logical pixel size we want.
		var backingStoreRatio = (ctx.webkitBackingStorePixelRatio ||
			ctx.mozBackingStorePixelRatio ||
			ctx.msBackingStorePixelRatio ||
			ctx.oBackingStorePixelRatio ||
			ctx.backingStorePixelRatio ||
			1);
		var scaleRatio = scaleFactor / backingStoreRatio;
		if (scaleFactor !== backingStoreRatio) {
			this.mCanvas.width = Math.floor(scaleRatio * CANVAS_WIDTH);
			this.mCanvas.height = Math.floor(scaleRatio * CANVAS_HEIGHT);
			this.mCanvas.style.width =  CANVAS_WIDTH + "px";
			this.mCanvas.style.height = CANVAS_HEIGHT + "px";
			ctx.scale(scaleRatio, scaleRatio);
		}

		// Calculate a scale factor for the y-axis.
		this.yScale = CANVAS_CONTENT_HEIGHT / this.mStyle.axis.numberOfVerticalLabels;
		this.yRatio = CANVAS_CONTENT_HEIGHT / this.maxY;

		// Compute the x-axis position of the last item we will plot.
		this.lastXPosition = canvasContentWidth;

		// Translate the canvas to include top/left margins and ignore the left axis.
		ctx.save();
		ctx.translate(this.mStyle.canvasLeftMargin, this.mStyle.canvasTopMargin);
		// Draw the background horizontal axis first (all axis excluding the zero-index axis).
		if (this.mOptions.showHorizontalAxis) {
			var NUMBER_OF_LABELS = this.mStyle.axis.numberOfVerticalLabels;
			var step = this.maxY / NUMBER_OF_LABELS;
			for (var i = 1; i <= NUMBER_OF_LABELS; i++) {
				var axisLabelValue = Math.round(step * i);
				if (axisLabelValue <= 0) axisLabelValue = "";
				var label = axisLabelValue;
				// Draw the label.
				if (this.mOptions.showVerticalLabels) {
					ctx.save();
					ctx.font = this.mStyle.axis.verticalAxisLabelFont;
					var labelWidth = ctx.measureText(label).width;
					ctx.translate((((-1) * labelWidth) + verticalAxisLabelGutter - verticalAxisLabelRightMargin), 0);
					CC.XcodeServer.Graphs.drawText(
						ctx,
						label,
						{x: 0, y: CANVAS_CONTENT_HEIGHT - this.scaleY(i) + this.mStyle.axis.verticalAxisLabelOffset},
						this.mStyle.axis.verticalAxisLabelFont,
						this.mStyle.axis.verticalAxisLabelColor
					);
					ctx.restore();
				}
			};
		};
		// Translate the context again to ignore the left axis and labels.
		ctx.translate(verticalAxisLabelGutter + axisWidth, 0);
		if (this.mOptions.showVerticalAxis) {
			var dataLength = this.mData.length;
			for (var idx = 1; idx <= dataLength; idx++) {
				CC.XcodeServer.Graphs.drawIntegralRect(
					ctx,
					{x: this.scaleX(idx), y: 0},
					{w: this.mStyle.axis.widths[1], h: CANVAS_CONTENT_HEIGHT},
					this.mStyle.axis.colors[1]
				);
			}
		};
		// Draw the horizontal axis labels.
		ctx.translate(Math.round(this.xScale / 2), 0);
		if (this.mOptions.showHorizontalLabels) {
			var dataLength = this.mData.length;
			for (var idx = 0; idx < dataLength; idx++) {
				var text = this.mData[idx]['integration'];
				var textWidth = ctx.measureText(text).width;
				var horizontalAxisFont = this.mStyle.axis.horizontalAxisLabelFont;
				if (text.toString().length == 4) {
					horizontalAxisFont = this.mStyle.axis.horizontalAxisLabelFontFourDigits;
				}
				else if (text.toString().length > 4) {
					horizontalAxisFont = this.mStyle.axis.horizontalAxisLabelFontFiveDigits;
				}
				CC.XcodeServer.Graphs.drawText(
					ctx,
					text,
					{x: (this.scaleX(idx) - Math.round(textWidth / 2)), y: CANVAS_CONTENT_HEIGHT + this.mStyle.axis.horizontalAxisLabelHeight + this.mStyle.axis.horizontalAxisLabelTopMargin},
					horizontalAxisFont,
					this.mStyle.axis.horizontalAxisLabelColor
				);
			}
		}
		// Draw the data.
		if (this.mGraphType == CC.XcodeServer.Graphs.GRAPH_TYPE_BAR_CHART) {
			var barWidth = this.mStyle.barchart.barWidth;
			this.mData.forEach(function(record, index) {
				var barX = (this.scaleX(index) - Math.floor(barWidth / 2));
				// Loop over the values, draw a bar for each and stack them.  First calculate
				// the number of non-zero bars we will draw.
				var valuesLength = (record.values.length || 0), totalValue = 0;
				for (var idx = 0; idx < valuesLength; idx++) {
					totalValue += (record.values[idx] || 0);
				}
				// Calculate the total height of the stack to avoid rounding errors as we draw each sub-bar.
				var totalBarHeight = this.ratioY(totalValue);
				var totalVisibleBarHeight = totalBarHeight - 1;
				var firstBarHasBeenPushedUp = false;
				// Start with the bottom border of the first bar hidden.
				var barY = 0, totalHeightSoFar = 0, barHeight = 0;
				record.values.forEach(function(value, idx) {
					if (value <= 0) return;
					// Calculate the height of this bar section.
					if ((valuesLength > 1) && (idx == (valuesLength - 1))) {
						barHeight = totalVisibleBarHeight - totalHeightSoFar;
					} else {
						barHeight = Math.round((value / totalValue) * totalVisibleBarHeight);
					}
					// Add an extra 1px to the bottom bar since we hide the bottom border below the bottom axis.
					if (!firstBarHasBeenPushedUp) {
						barHeight += 1;
						firstBarHasBeenPushedUp = true;
					}
					CC.XcodeServer.Graphs.drawIntegralRect(
						ctx,
						{x: barX, y: (CANVAS_CONTENT_HEIGHT - barY)},
						{w: barWidth, h: (-1 * barHeight)},
						this.mStyle.barchart.backgroundColors[idx],
						this.mStyle.barchart.borderColors[idx],
						this.mStyle.barchart.borderWidth
					);
					barY += barHeight;
					totalHeightSoFar += barHeight;
				}, this);
			}, this);
		}
		else if (this.mGraphType == CC.XcodeServer.Graphs.GRAPH_TYPE_LINE_GRAPH) {
			// Draw the gradient, using a shape tracking the dots we are about to plot.
			ctx.beginPath();
			this.mData.forEach(function(record, index) {
				var pointX = this.scaleX(index);
				var pointY = (CANVAS_CONTENT_HEIGHT - this.ratioY(record.values[0]));
				ctx.lineTo(pointX, pointY);
				// Close the path at the last point
				if (index == this.mData.length - 1) {
					ctx.lineTo(pointX, CANVAS_CONTENT_HEIGHT);
					ctx.lineTo(0, CANVAS_CONTENT_HEIGHT);
					ctx.closePath();
				}
			}, this);
			var grad = ctx.createLinearGradient(0, 0, 0, CANVAS_CONTENT_HEIGHT);
			grad.addColorStop(0, this.mStyle.linegraph.gradientColors[0]);
			grad.addColorStop(0.5, this.mStyle.linegraph.gradientColors[0]);
			grad.addColorStop(1, this.mStyle.linegraph.gradientColors[1]);
			ctx.fillStyle = grad;
			ctx.fill();
			// Plot data points line with small dots along the way.
			ctx.lineWidth = this.mStyle.linegraph.lineWidth
			ctx.strokeStyle = this.mStyle.linegraph.lineColor;
			ctx.beginPath();
			this.mData.forEach(function(record, index) {
				var pointX = this.scaleX(index);
				var pointY = (CANVAS_CONTENT_HEIGHT - this.ratioY(record.values[0]));
				ctx.lineTo(pointX, pointY);
				ctx.arc(pointX, pointY, this.mStyle.linegraph.pointsRadius, 0, (Math.PI * 2), true);
				ctx.moveTo(pointX, pointY);
			}, this);
			ctx.stroke();
			// For the currently selected index, draw a big blue dot by drawing 3 circles filled with linear gradients.
			if (this.mOptions.showSelection && this.currentSelectedIndex !== undefined) {
				var selectedItem = this.mData[this.currentSelectedIndex];
				var selectionPoint = {
					x: this.scaleX(this.currentSelectedIndex),
					y: (CANVAS_CONTENT_HEIGHT - this.ratioY(selectedItem.total))
				};
				var dotRadiuses = this.mStyle.linegraph.selectionDotRadiuses;
				ctx.beginPath();
				ctx.arc(selectionPoint.x, selectionPoint.y, dotRadiuses[0], 0, Math.PI*2, true);
				ctx.moveTo(selectionPoint.x + dotRadiuses[1], selectionPoint.y);
				ctx.arc(selectionPoint.x, selectionPoint.y, dotRadiuses[1], 0, Math.PI*2, false);
				ctx.moveTo(selectionPoint.x + dotRadiuses[2], selectionPoint.y);
				ctx.arc(selectionPoint.x, selectionPoint.y, dotRadiuses[2], 0, Math.PI*2, true);
				ctx.closePath();
				var grad = ctx.createLinearGradient(0, (selectionPoint.y - dotRadiuses[2]), 0, (selectionPoint.y + dotRadiuses[2]));
				grad.addColorStop(0, this.mStyle.linegraph.selectionDotGradientColors[0]);
				grad.addColorStop(1, this.mStyle.linegraph.selectionDotGradientColors[1]);
				ctx.fillStyle = grad;
				ctx.strokeStyle = this.mStyle.linegraph.selectionDotBorderColor;
				ctx.lineWidth = 0.5;
				ctx.fill();
				ctx.stroke();
			}
		}
		// Draw the baseline.
		if (this.mOptions.showBaseline && this.mMetaData.baselineValue) {
			var BASELINE_TEXT = this.mStyle.baseline.textValue;
			var BASELINE_FONT_SIZE = this.mStyle.baseline.tokenFontSize;
			var BASELINE_FONT_DESCRIPTION = this.mStyle.baseline.tokenFont;
			ctx.font = BASELINE_FONT_DESCRIPTION;
			var BASELINE_STRING_SIZE = {
				w: ctx.measureText(BASELINE_TEXT).width,
				h: BASELINE_FONT_SIZE - this.mStyle.baseline.tokenBottomPaddingHack
			};
			var BASELINE_LINE_WIDTH = this.scaleX(this.mData.length) - (2 * this.mStyle.baseline.sideMargin);
			var TOKEN_PADDING = this.mStyle.baseline.tokenPadding;
			var baselineCenter = {
				x: (this.mStyle.baseline.sideMargin + (BASELINE_LINE_WIDTH / 2)),
				y: (CANVAS_CONTENT_HEIGHT - this.ratioY(this.mMetaData.baselineValue))
			};
			// Draw a gradient line for the baseline.
			var TOKEN_AND_LINE_COLOR = this.mStyle.baseline.tokenAndLineColor;
			var BASELINE_LINE_HEIGHT = this.mStyle.baseline.baselineLineHeight;
			var grad = ctx.createLinearGradient(this.mStyle.baseline.sideMargin, BASELINE_LINE_HEIGHT, (this.mStyle.baseline.sideMargin + BASELINE_LINE_WIDTH), BASELINE_LINE_HEIGHT);
			var gradColors = this.mStyle.baseline.baselineLineGradientColors;
			var gradColorStops = this.mStyle.baseline.baselineLineGradientColorStops;
			for (var idx = 0; idx < gradColors.length; idx++) {
				grad.addColorStop(gradColorStops[idx], gradColors[idx]);
			}
			CC.XcodeServer.Graphs.drawIntegralRect(
				ctx,
				{x: this.mStyle.baseline.sideMargin, y: (baselineCenter.y - (BASELINE_LINE_HEIGHT / 2))},
				{w: BASELINE_LINE_WIDTH, h: BASELINE_LINE_HEIGHT},
				grad
			);
			// Draw the text in a box on top of the baseline.
			CC.XcodeServer.Graphs.drawIntegralRect(
				ctx,
				{x: (baselineCenter.x - BASELINE_STRING_SIZE.w / 2 - TOKEN_PADDING.x), y: (baselineCenter.y - BASELINE_STRING_SIZE.h / 2 - TOKEN_PADDING.y)},
				{w: (BASELINE_STRING_SIZE.w + TOKEN_PADDING.x * 2), h: (BASELINE_STRING_SIZE.h + TOKEN_PADDING.y * 2)},
				TOKEN_AND_LINE_COLOR,
				null,
				null,
				5
			);
			CC.XcodeServer.Graphs.drawText(
				ctx,
				BASELINE_TEXT,
				{x: (baselineCenter.x - BASELINE_STRING_SIZE.w / 2), y: (baselineCenter.y + BASELINE_STRING_SIZE.h / 2)},
				BASELINE_FONT_DESCRIPTION,
				this.mStyle.baseline.tokenFontColor,
				this.mStyle.baseline.tokenFontShadowSpec
			);
		}
		// Draw the zero-index axis so they appear on top of everything.
		ctx.restore();
		if (this.mOptions.showHorizontalAxis) {
			var horizontalAxisWidth = CANVAS_CONTENT_WIDTH;
			if (this.mOptions.showVerticalAxis) horizontalAxisWidth += (axisWidth + verticalAxisLabelGutter);
			CC.XcodeServer.Graphs.drawIntegralRect(
				ctx,
				{x: 0, y: CANVAS_CONTENT_HEIGHT},
				{w: horizontalAxisWidth, h: axisWidth},
				this.mStyle.axis.colors[0]
			);
		}
		if (this.mOptions.showVerticalAxis) {
			CC.XcodeServer.Graphs.drawIntegralRect(
				ctx,
				{x: verticalAxisLabelGutter, y: 0},
				{w: axisWidth, h: CANVAS_CONTENT_HEIGHT + 1},
				this.mStyle.axis.colors[0]
			);
		}
	},
	// Returns a zero-padded string, e.g. 0012 instead of 12.
	toPaddedString: function(inNumber, inLength) {
		var string = inNumber.toString(10),
		slength = string.length;
		for (var i = 0; i < (inLength - slength); i++) string = "0" + string;
		return string;
	},
	// Clones a dictionary into a new instance.
	deepClone: function(inObject) {
		if (inObject == null || inObject.constructor != Object) return inObject;
		var newObject = new Object();
		for (var key in inObject) newObject[key] = this.deepClone(inObject[key]);
		return newObject;
	},
	// Recursively merges two dictionaries together. Returns an updated reference to the first.
	mergeRecursive: function(inFirstObject, inSecondObject) {
		for (var prop in inSecondObject) {
			try {
				// If the property we're trying to merge is an object, do it recursively. Use an
				// exception as a catchall for when a property in the destination object is not set.
				if (inSecondObject[prop].constructor == Object) {
					inFirstObject[prop] = this.mergeRecursive(inFirstObject[prop], inSecondObject[prop]);
				} else {
					inFirstObject[prop] = inSecondObject[prop];
				}
			} catch (e) {
				inFirstObject[prop] = inSecondObject[prop];
			}
		}
		return inFirstObject;
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Class for a simple menu item, which is a wrapper around an <li> element with some added sauce.

CC.MenuItems = CC.MenuItems || new Object();

CC.MenuItem = Class.create({
	mDisplayTitle: null,
	mDisplayTitleLocKey: null,
	mTooltip: null,
	mTooltipLocKey: null,
	mClassName: null,
	mURL: null,
	initialize: function() {
		// Build the DOM element for this menu item.
		this.mElement = this.buildElement();
		// Attach a unique identifer we can use to register this with the global event delegate.
		var randomString = buildRandomString();
		this.mElement.setAttribute('data-responder-id', randomString);
		// Register this event responder (only when we're actually using routes).
		if (!this.mURL) {
			globalEventDelegate().registerDomResponderForEventByIdentifer('click', randomString, this.handleElementClicked.bindAsEventListener(this));
		}
	},
	getAccessibilityID: function() { /* interface */ },
	getElementID: function() { /* interface */ },
	buildElement: function() {
		var li = document.createElement('li');
		var a = document.createElement('a');
		var displayTitle = this.mDisplayTitle;
		if (!displayTitle && this.mDisplayTitleLocKey) displayTitle = this.mDisplayTitleLocKey.loc();
		a.innerHTML = (displayTitle ? displayTitle.escapeHTML() : "???");
		if (this.mTooltip) {
			a.title = this.mTooltip;
		} else if (this.mTooltipLocKey) {
			a.title = this.mTooltipLocKey.loc();
		}
		a.className = "cc-menu-item"
		a.setAttribute('tabindex', this.getAccessibilityID());
		a.setAttribute('role', 'menuitem');
		
		// Used for aria-labelledBy attribute
		if (this.getElementID())
			a.setAttribute('id', this.getElementID());
		
		if (this.mClassName) a.className += " %@".fmt(this.mClassName);
		if (this.mURL) a.href = this.mURL;
		li.appendChild(a);
		return Element.extend(li);
	},
	handleElementClicked: function(inEvent) {
		this.action(inEvent);
	},
	// Your subclass should override this function.
	itemShouldDisplay: function() {
		return true;
	},
	// Updates the hidden state of this menu extra by evaluating itemShouldDisplay.  If your subclass needs
	// to update itself (e.g. changing the displayed text), override this function and do it there.
	updateDisplayState: function() {
		var shouldDisplay = this.itemShouldDisplay();
		shouldDisplay ? this.mElement.show() : this.mElement.hide();
		return shouldDisplay;
	},
	markAsSelected: function(inOptShouldBeSelected) {
		var selected = (inOptShouldBeSelected == undefined ? true : inOptShouldBeSelected);
		if (selected && !this.mElement.hasClassName('selected')) {
			this.mElement.addClassName('selected');
		} else if (!selected && this.mElement.hasClassName('selected')) {
			this.mElement.removeClassName('selected');
		}
	},
	// Your subclass should implement this function or set mURL on this class.
	action: function(inEvent) {}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.MenuItems.About = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.About.Title".loc(),
	action: function(e) {
		dialogManager().showProgressMessage("_Loading".loc());
		var batch = [
			['ServerVersionService', 'currentServerVersion'],
			['ServerVersionService', 'currentOperatingSystemVersion'],
			['ServerVersionService', 'currentXcodeVersion']
		];
		service_client().batchExecuteAsynchronously(batch, null, function(inBatchedResponse) {
			if (inBatchedResponse && inBatchedResponse.responses && inBatchedResponse.responses.length > 2) {
				var currentServerVersion = inBatchedResponse.responses[0].response;
				var currentOperatingSystemVersion = inBatchedResponse.responses[1].response;
				var currentXcodeVersion = inBatchedResponse.responses[2].response;
				var aboutString = "_Server.About.Dialog.Description.NoXcode".loc(currentServerVersion, currentOperatingSystemVersion);
				if (currentXcodeVersion) {
					aboutString = "_Server.About.Dialog.Description.Xcode".loc(currentServerVersion, currentOperatingSystemVersion, currentXcodeVersion);
				}
				dialogManager().hideProgressMessage();
				var dialog = $('server_about_dialog');
				if (dialog) Element.remove(dialog);
				dialogManager().drawDialog('server_about_dialog', [aboutString], "_Dialogs.OK".loc(), null, "_Server.About.Dialog.Title".loc());
				$('server_about_dialog_cancel').hide();
				dialogManager().addClassName('server_about_dialog', 'selectable');
				dialogManager().show('server_about_dialog', null, null);
			}
		}, function() {
			dialogManager().hideProgressMessage();
			notifier().printErrorMessage("_Load.Error.CouldNotLoadIngoFromServer".loc());
		});
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_ABOUT);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.MenuItems.Delete = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.Delete.Title".loc(),
	updateDisplayState: function($super) {
		var locPrefix = '';
		if (document.body.hasClassName('pages')) locPrefix = "Page.";
		if (document.body.hasClassName('projects')) locPrefix = "Project.";
		if (document.body.hasClassName('files')) locPrefix = "File.";
		if (document.body.hasClassName('pages') && CC.meta('x-apple-entity-isBlogpost') == "true") locPrefix = "Blog.";
		this.mElement.down('a').update("_ActionMenu.Delete.%@Title".fmt(locPrefix).loc());
		$super();
	},
	itemShouldDisplay: function() {
		var ownerType = CC.meta('x-apple-owner-type');
		var supportedEntity = (ownerType == 'com.apple.entity.Page' || ownerType == 'com.apple.entity.Wiki' || ownerType == 'com.apple.entity.File' || ownerType == 'com.apple.entity.Blog');
		return (supportedEntity && (CC.meta('x-apple-user-can-delete') == 'true') && (CC.meta('x-apple-entity-tinyID') != "serverhome"));
	},
	action: function(e) {
		var dialog = $('delete_entity_dialog');
		if (dialog) Element.remove(dialog);
		var locPrefix = '';
		if (document.body.hasClassName('pages')) locPrefix = "Page.";
		if (document.body.hasClassName('projects')) locPrefix = "Project.";
		if (document.body.hasClassName('files')) locPrefix = "File.";
		if (document.body.hasClassName('pages') && CC.meta('x-apple-entity-isBlogpost') == "true") locPrefix = "Blog.";
		var fields = ["_Dialogs.Delete.%@Description".fmt(locPrefix).loc()];
		var canDeletePermanently = CC.meta('x-apple-user-is-admin') == "true";
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_DELETE_PAGE);
		if (canDeletePermanently) {
			fields.push({contents:'<label tabindex="-1" for="delete_entity_dialog_permanent_delete"><input tabindex="' + tabIndex + '" role="checkbox" id="delete_entity_dialog_permanent_delete" type="checkbox" />' + "_Dialogs.Delete.Permanently".loc() +'</label>'});
		}
		dialogManager().drawDialog('delete_entity_dialog', fields, "_Dialogs.Delete.OK".loc(), false, "_Dialogs.Delete.%@Title".fmt(locPrefix).loc());
		dialogManager().show('delete_entity_dialog', null, this.onDeleteConfirm.bind(this));		

		if (dialog) {
			var firstAction = dialog.querySelector('input[type="submit"]');
			if(firstAction) 
				firstAction.focus();
		}
	},
	onDeleteConfirm: function() {
		var permanentlyDeleteCheckbox = $('delete_entity_dialog_permanent_delete');
		var canPermanentlyDelete = false;
		if (permanentlyDeleteCheckbox) canPermanentlyDelete = $F('delete_entity_dialog_permanent_delete');
		var detailPage = CC.meta('x-apple-entity-isDetailPage');
		var entityGUID = CC.meta('x-apple-entity-guid');
		if (detailPage == "true") entityGUID = CC.meta('x-apple-owner-guid');
		server_proxy().deleteEntityWithGUID(entityGUID, canPermanentlyDelete, this.onDeleteSuccess.bind(this), this.onDeleteFailure.bind(this));
	},
	onDeleteSuccess: function(response) {
		var url = env().root_path;
		var parentTinyID = CC.meta('x-apple-owner-tinyID');
		var parentType = CC.meta('x-apple-owner-type');
		if (parentType == 'com.apple.entity.User' && parentTinyID) {
		    url = "#{prefix}/people/#{tinyID}".interpolate({
				prefix: env().root_path,
				tinyID: parentTinyID
			});
		}
		else if (parentType == 'com.apple.entity.Wiki') {
			if (CC.meta('x-apple-entity-isDetailPage') == "true") {
				url += '/projects';
				url = url.replace(/\/{2,}/, '/');
			} else {
				url = "#{prefix}/projects/#{tinyID}".interpolate({
					prefix: env().root_path,
					tinyID: parentTinyID
				});
			}
		}
		window.location.href = url;
	},
	onDeleteFailure: function(response) {
		var owner_type = CC.meta('x-apple-owner-type');
		var errorString = "_Dialogs.Delete.Notification.NotBotOwner.Error".loc();
		if (owner_type && owner_type == "com.apple.entity.Wiki") {
			errorString = "_Dialogs.Delete.Notification.NotProjectOwner.Error".loc();
		}
		notifier().printErrorMessage(errorString);
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_DELETE);
	}	
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.MenuItems.Help = Class.create(CC.MenuItem, {
	mDisplayTitle: "_ActionMenu.Help.Title".loc(),
	mHelpLink: "",
	buildElement: function($super) {
		var elem = $super();
		var link = elem.down('a');
		link.target = '_blank';
		link.href = this.mHelpLink;
		return elem;
	},
	handleElementClicked: function(e) {
		// Override so we don't stop the event and break the link redirect.
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_HELP);
	}	
});

CC.MenuItems.Help.Wiki = Class.create(CC.MenuItems.Help, {
	mHelpLink: '_Help.Desktop.URL'.loc()
});

CC.MenuItems.Help.Xcs = Class.create(CC.MenuItems.Help, {
	mHelpLink: '_XC.Help.Desktop.URL'.loc()
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.MenuItems.GearMenu = Class.create(CC.MenuItem, {
	mDisplayTitle: "_MenuItem.Gear".loc(),
	mClassName: 'gear',
	action: function(e) {
		// Show the gear menu attached to the shared header view.
		sharedHeaderView.mGearMenu.toggle();
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR);
	}	
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.MenuItems.Login = Class.create(CC.MenuItem, {
	mDisplayTitle: "_MenuItem.LogIn".loc(),
	mClassName: 'login',
	itemShouldDisplay: function() {
		return (CC.meta('x-apple-user-logged-in') != "true");
	},
	action: function(inEvent) {
		inEvent.preventDefault();

		if ( browser().isiPhone() ) {
			var currentURL = window.location;
			window.location = "/auth?send_token=no&redirect="+currentURL;
			return;
		}
		else {
			authenticator().displayFramedLoginPrompt(function(){
				window.location.reload();
			});
		}
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_LOGIN);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.MenuItems.Logout = Class.create(CC.MenuItem, {
	mDisplayTitle: "_MenuItem.LogOut".loc(),
	mClassName: 'logout',
	itemShouldDisplay: function() {
		return (CC.meta('x-apple-user-logged-in') == "true");
	},
	buildElement: function($super) {
		var loggedInUsername = CC.meta('x-apple-username');
		this.mTooltip = "_Login.LoggedInUser".loc(loggedInUsername);
		return $super();
	},
	action: function(e) {
		// Confirm the user really wants to log out.
		if ($('logout_confirm_dialog')) Element.remove('logout_confirm_dialog');
		dialogManager().drawDialog('logout_confirm_dialog', ["_Logout.Confirm.Dialog.Description".loc()], "_Logout.Confirm.Dialog.OK".loc(), null, "_Logout.Confirm.Dialog.Title".loc());
		// Show the delete block dialog.
		dialogManager().show('logout_confirm_dialog', null, function() {
			authenticator().logout();
		}.bind(this), undefined, false, undefined, false);
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_LOGOUT);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.MenuItems.PlusMenu = Class.create(CC.MenuItem, {
	mDisplayTitle: "Plus".loc(),
	mClassName: 'add',
	action: function(e) {
		// Show the plus menu attached to the shared header view.
		sharedHeaderView.mPlusMenu.toggle();
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.Menu = Class.create({

	initialize: function(element, anchor, inOptBeforeShowCallback) {
		var element = $(element);
		if (element.parentNode) element.remove();
		element.show();
		
		this.menu = $(Builder.node('div'));
		this.menu.addClassName('cc-menu');
		this.menu.setStyle({
			position: 'absolute',
			zIndex: '800'
		});
		this.menu.insert(element);
		this.menu.hide();
		this.menu.on('click', this.onMenuClick.bindAsEventListener(this));
		
		this.anchor = $(anchor);
		this.anchor.on('click', this.onAnchorClick.bindAsEventListener(this));
		
		this.mask = $(Builder.node('div'));
		this.mask.addClassName('cc-menu-mask');
		this.mask.setStyle({
			position: 'fixed',
			top: '0px',
			bottom: '0px',
			left: '0px',
			right: '0px',
			zIndex: '700'
		});
		this.mask.on('click', this.onMaskClick.bindAsEventListener(this));
		this.mask.hide();
		
		if (inOptBeforeShowCallback) this.mBeforeShowCallback = inOptBeforeShowCallback;
		
		if (window.orientation || window.orientation === 0)
			this.menu.on('orientationchange', this.onOrientationChange.bindAsEventListener(this));
		
		document.body.appendChild(this.mask);
		document.body.appendChild(this.menu);
	},
	
	onMenuClick: function(e) {
		this.close();
	},
	onAnchorClick: function(e) {
		e.stop();
		this.open();
	},
	onMaskClick: function(e) {
		e.stop();
		this.close();
	},
	
	onOrientationChange: function() {
		if (this.anchor.up('li')) this.anchor.up('li').removeClassName('open');
		this.mask.hide();
		this.menu.hide();
	},
	
	open: function() {
		if (this.anchor.up('li')) this.anchor.up('li').addClassName('open');
		this.positionElementToAnchor();
		this.mask.show();
		this.menu.show();
		if (this.mBeforeShowCallback) this.mBeforeShowCallback();
	},
	close: function() {
		if (this.anchor.up('li')) this.anchor.up('li').removeClassName('open');
		this.mask.hide();
		this.menu.hide();
	},
	toggle: function() {
		this.menu.visible() ? this.close() : this.open();
	},
	
	positionElementToAnchor: function() {
		this.menu.show();
		var mLayout = this.menu.getLayout();
		var aLayout = this.anchor.getLayout();
		this.menu.clonePosition(this.anchor, {
			setWidth:   false,
			setHeight:  false,
			offsetTop:  aLayout.get('border-box-height') - 2, // 2px  is to account for the difference between the real and apparent boundaries of the anchor, because of the use of a background image to simulate the anchor borders
			offsetLeft: aLayout.get('border-box-width') - mLayout.get('border-box-width')
		});
		this.menu.hide();
	},
	
	destroy: function() {
		this.anchor.stopObserving('click', this.onAnchorClick.bindAsEventListener(this));
		Element.remove(this.menu);
		Element.remove(this.mask);
		delete this;
	}

});

// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.




// Black header bar view class.

CC.HeaderView = Class.create(CC.Mvc.View, {
	mBreadcrumbItems: [],
	mTopLevelMenuItems: [
		new CC.MenuItems.PlusMenu(),
		new CC.MenuItems.GearMenu(),
		new CC.MenuItems.Login(),
		new CC.MenuItems.Logout()
	],
	mTopLevelPlusMenuIndex: 0,
	mTopLevelGearMenuIndex: 1,
	mPlusMenuItems: [],
	mGearMenuItems: [],
	initialize: function($super) {
		$super();
		// Automatically update when meta tags change
		globalNotificationCenter().subscribe(CC.Meta.NOTIFICATION_DID_REFRESH_META_TAGS, this.updateDisplayStateForMenuItems.bind(this));
	},
	render: function() {
		var header = Builder.node('div', {id: 'header', className: 'cc-header-view chrome'}, [
			this.renderBreadcrumbs(),
			this.renderTopLevelMenuItems(),
			Builder.node('div', {style: 'display: block; clear: both;'})
		]);
		this.mPoliteLoginPrompt = new CC.PoliteLoginPrompt();
		return header;
	},
	makeAccessible: function() {
		
		// Set Navigation landmark (Actions/Nav)
		this.mParentElement.writeAttribute('role', 'toolbox');
		this.mParentElement.writeAttribute('aria-label', "_Accessibility.Navigation.Main".loc());
		
		// Add role to actions in the Navigation landmark
		var navigationItems = this.mParentElement.querySelectorAll("li:not([style*='display: none']) a");	
		
		for (var i = 0; i < navigationItems.length; i++) {			
			navigationItems[i].writeAttribute("role", "button");
			navigationItems[i].writeAttribute("aria-haspopup", "true");			
		}
		
		// search box
		var search = this.mParentElement.querySelector('#search');
		if (search) {
			search.writeAttribute("role", "search");
		}
		
	},
	handleDidRenderView: function($super, inOptInfo) {
		$super(inOptInfo);
		this.setPlusMenuItems(this.mPlusMenuItems);
		this.setGearMenuItems(this.mGearMenuItems);
	},
	renderBreadcrumbs: function() {
		var ul = Builder.node('ul', {'role': 'presentation', className: 'buttonbar hierarchy'});
		var breadcrumbs = this.mBreadcrumbItems, breadcrumb;
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GENERAL);
		// First append the first breadcrumb which is always added automatically.
		this.cachedNavLink = this.cachedNavLink || Builder.node('li', {'role': 'presentation'}, [
			Builder.node('a', {tabindex: tabIndex}, "_General.Navigation".loc())
		]);
		ul.appendChild(this.cachedNavLink);
		// Next iterate over any breadcrumbs we were passed and render breadcrumbs in order.
		var a;
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GENERAL);
		for (var idx = 0; idx < breadcrumbs.length; idx++) {
			breadcrumb = breadcrumbs[idx];
			a = document.createElement('a');
			a.writeAttribute('tabindex', ++tabIndex); // using a range from 10 to 19 (collition with 20: we don't have more then 5 items...)
			if (breadcrumb.mURL) a.href = breadcrumb.mURL;
			if (breadcrumb.mTooltip) a.title = breadcrumb.mTooltip;
			a.innerHTML = (breadcrumb.mDisplayTitle || "###").strip().escapeHTML();
			ul.appendChild(Builder.node('li', [a]));
		}
		return ul;
	},
	// Updates the breadcrumb bar for the current set of items.
	updateBreadcrumbsFromItems: function() {
		var _ul = this.mParentElement.down('ul.hierarchy');
		var ul = this.renderBreadcrumbs();
		_ul.parentElement.replaceChild(ul, _ul);
	},
	// Updates the current set of breadcrumb items and redraws the breadcrumb bar.
	setBreadcrumbItems: function(inBreadcrumbItems) {
		this.mBreadcrumbItems = (inBreadcrumbItems || []);
		this.updateBreadcrumbsFromItems();
	},
	resetBreadcrumbItems: function() {
		this.setBreadcrumbItems([]);
	},
	// Updates the current set of plus menu items.
	setPlusMenuItems: function(inPlusMenuItems) {
		this.mPlusMenuItems = (inPlusMenuItems || []);
		if (this.mPlusMenu) this.mPlusMenu.destroy();
		var addButton = this.$().down('a.add');
		if (addButton) {
			Event.stopObserving('click', addButton);
			this.mPlusMenu = new CC.Menu(this.__buildListFromMenuItems(this.mPlusMenuItems), addButton, this.updateDisplayStateForMenuItems.bind(this));
		}
		this.updateDisplayStateForMenuItems();
	},
	resetPlusMenuItems: function() {
		this.setPlusMenuItems([]);
	},
	// Updates the current set of gear menu items.
	setGearMenuItems: function(inGearMenuItems) {
		this.mGearMenuItems = (inGearMenuItems || []);
		if (this.mGearMenu) this.mGearMenu.destroy();
		var gearButton = this.$().down('a.gear');
		if (gearButton) {
			Event.stopObserving('click', gearButton);
			var items = this.mGearMenuItems;
			this.mGearMenu = new CC.Menu(this.__buildListFromMenuItems(items), gearButton, this.updateDisplayStateForMenuItems.bind(this));
		}
		this.updateDisplayStateForMenuItems();
	},
	resetGearMenuItems: function() {
		this.setGearMenuItems([]);
	},
	// Helper function that builds a <ul> element from an array of CC.MenuItem instances.
	__buildListFromMenuItems: function(inMenuItems) {
		var ul = document.createElement('ul');
		var items = (inMenuItems || []) , item;
		for (var idx = 0; idx < items.length; idx++) {
			item = items[idx];
			if (item && item.mElement) ul.appendChild(item.mElement); 
		}
		return ul;
	},
	renderTopLevelMenuItems: function() {
		var ul = this.__buildListFromMenuItems(this.mTopLevelMenuItems);
		ul.className = 'buttonbar actions';
		ul.writeAttribute('role', 'presentation');
		return ul;
	},
	// Updates the display state for all menu items.
	updateDisplayStateForMenuItems: function() {
		this.__updateDisplayStateForMenuItems(this.mTopLevelMenuItems);
		if (this.mTopLevelPlusMenuIndex != undefined) {
			var showPlusMenu = this.__updateDisplayStateForMenuItems(this.mPlusMenuItems);
			var plusMenuElement = this.mTopLevelMenuItems[this.mTopLevelPlusMenuIndex].mElement;
			if (plusMenuElement) showPlusMenu ? plusMenuElement.show() : plusMenuElement.hide();
		}
		if (this.mTopLevelGearMenuIndex != undefined) {
			this.__updateDisplayStateForMenuItems(this.mGearMenuItems);
			// Always show the gear menu (because we always show at least the help item).
			var gearMenuElement = this.mTopLevelMenuItems[this.mTopLevelGearMenuIndex].mElement;
			if (gearMenuElement) gearMenuElement.show();
		}
	},
	__updateDisplayStateForMenuItems: function(inMenuItems) {
		var items = (inMenuItems || []), item;
		var atLeastOneItemShown = false;
		for (var idx = 0; idx < items.length; idx++) {
			item = items[idx];
			if (item) {
				var didShow = item.updateDisplayState();
				if (didShow) atLeastOneItemShown = true;
			}
		}
		return atLeastOneItemShown;
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Main view class.

CC.MainView = Class.create(CC.Mvc.View, {
	render: function() {
		var backgroundImageURL = this.getBackgroundImageURL();
		var elem = Builder.node('div', {id: 'main', className: 'cc-main-view wrapchrome', 'style': (backgroundImageURL ? 'background-repeat: repeat; background-position: top left; background-image: url(%@)'.fmt(backgroundImageURL) : '')});
		elem.appendChild(Builder.node('div', {id: 'content', className: 'animates wrapchrome no-secondary'}, [
			Builder.node('div', {id: 'content-inner'}, [
				Builder.node('div', {id: 'content-primary', className: 'wrapchrome'}),
				Builder.node('div', {id: 'content-secondary', className: 'wrapchrome'}),
				Builder.node('div', {style: 'display: block; clear: both;', className: 'chrome'})
			])
		]));
		if (!globalCookieManager().getCookie('cc.sidebar_closed')) {
			elem.down('div#content').removeClassName('no-secondary');
		}
		return elem;
	},
	makeAccessible: function() {
			
		// Set Navigation landmark (Actions/Nav)
		var main = this.mParentElement.querySelector('#content-primary');
		main.writeAttribute('aria-label', "_Accessibility.Navigation.PageContent".loc());
	},
	getBackgroundImageURL: function() { /* Interface */ },
	updateDisplayState: function() {
		var element = this.$();
		// Do we have a background image?
		var backgroundImageURL = this.getBackgroundImageURL();
		element.setStyle({
			backgroundRepeat: 'repeat',
			backgroundPosition: 'top left',
			backgroundImage: (backgroundImageURL ? 'url(%@)'.fmt(backgroundImageURL) : '')
		});
	}
});
// Copyright (c) 2012-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.Popover = Class.create(CC.Keyboard.Mixins.Responder, {
	initialize: function(inOptToggleBtn) {
		var element = Builder.node('div', {className:"popover left"}, [
			Builder.node('div', {className: "content"}),
			Builder.node('div', {className: "norgie"})
		]);
		var content = this.renderPopoverContent();
		if (content) element.down('.content').appendChild(content);
		this.element = element;
		this.toggleButton = inOptToggleBtn;
		if (this.toggleButton) {
			this.toggleButton.on('click', this.toggle.bindAsEventListener(this));
		}
		this.element.hide();
		this.visible = false;
		document.body.appendChild(this.element);
		Event.observe(window, 'mousedown', this.handleWindowMouseDown.bindAsEventListener(this));
		this.makeAccessible();
	},
	renderPopoverContent: function() { /* Interface */
		return document.createElement('div');
	},
	makeAccessible: function() { },
	show: function() {
		this.becomeFirstResponder();
		this.element.show();
		this.visible = true;
	},
	hide: function() {
		this.element.hide();
		this.visible = false;
		this.currentItem = 0;
		this.loseFirstResponder();
	},
	toggle: function() {
		if (this.visible) {
			this.hide();
		}
		else {
			this.show();
		}
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		switch (inMessage) {
		case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC:
			if (!this.visible) break;
			this.hide();
			return true;
		default:
			if (this.visible) return true;
			break;
		}
	},
	handleWindowMouseDown: function(inEvent) {
		if (!this.visible) return;
		if (this.toggleButton && inEvent.findElement('a, div, button, input, li') == this.toggleButton) return;
		if (inEvent.findElement('.popover') == this.element) return;
		this.hide();
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.NAV_POPOVER_DEFAULT_APPLICATION_XCODE_IDENTIFIER = 'xcode';
CC.NAV_POPOVER_DEFAULT_APPLICATION_WIKI_IDENTIFIER = 'wiki';

CC.NAV_POPOVER_DEFAULT_APPLICATIONS = [
	{
		'mURL': '/xcode',
		'mIdentifier': CC.NAV_POPOVER_DEFAULT_APPLICATION_XCODE_IDENTIFIER,
		'mDisplayTitle': "_NavPopover.Application.Xcode.Title".loc(),
		'mShouldDisplayCalculator': function() {
			return CC.meta("x-apple-service-xcode-enabled") == "true";
		}
	},
	{
		'mURL': '/wiki',
		'mIdentifier': CC.NAV_POPOVER_DEFAULT_APPLICATION_WIKI_IDENTIFIER,
		'mDisplayTitle': "_NavPopover.Application.Wiki.Title".loc(),
		'mShouldDisplayCalculator': function() {
		return CC.meta("x-apple-service-wiki-enabled") == "true";
		}
	}
];

CC.NavPopover = Class.create(CC.Popover, {
	mNavigationItems: [],
	mActiveApplicationIdentifier: null,
	initialize: function($super, inNavigationItems, inActiveApplicationIdentifier) {
		// Default the anchor position to the first link on the header element (if it exists).
		var anchor = $('header') ? $('header').down('.buttonbar.hierarchy a') : null;
		if (inNavigationItems) this.mNavigationItems = $A(inNavigationItems);
		if (inActiveApplicationIdentifier) this.mActiveApplicationIdentifier = inActiveApplicationIdentifier;
		$super(anchor);
		this.element.setAttribute('id', 'cc-navpopover');
	},
	renderPopoverContent: function() {
		var buildSection = function(url, className, locTitle, locDescription, isSubitem) {
			var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GENERAL);
			var section = Builder.node('a', {href:url, className: "cc-navpopover-item %@%@".fmt(className, (isSubitem ? ' subitem' : '')), tabindex: tabIndex}, [
				Builder.node('span', {className: "icon"}),
				Builder.node('span', {className: "title ellipsis"}, locTitle.loc())
			]);
			if (locDescription) section.setAttribute('title', locDescription.loc());
			return section;
		}
		// Create a document fragment we can use to start assembling the popover contents.
		var fragment = document.createDocumentFragment();
		// Include a user icon as the nav popover header if we're logged in.
		var currentUserLoggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		if (currentUserLoggedIn) {
			var currentUserLogin = CC.meta('x-apple-username');
			var avatarGUID = CC.meta("x-apple-user-avatarGUID");
			var avatarURL = iconURIForEntity({
				'type': 'com.apple.entity.User',
				'avatarGUID': avatarGUID
			});
			var currentUserDisplayName = (CC.meta("x-apple-user-longName") || CC.meta("x-apple-user-shortName"));
			var userElement = Builder.node('div', {'className': "user"}, [
				Builder.node('div', {'role': 'presentation', 'className': 'avatar%@'.fmt(avatarGUID ? '' : ' default')}, [
					Builder.node('img', {'role': 'presentation', 'className': 'avatar_img'}),
					Builder.node('div', {'role': 'presentation', 'className': 'avatar_mask'})
				]),
				Builder.node('div', {'role': 'presentation', 'className': 'fullname ellipsis'}, currentUserDisplayName)
			]);
			if (avatarURL) userElement.down('img').src = avatarURL;
			fragment.appendChild(userElement);
		}
		// Draw the menu items.
		for (var idx = 0; idx < CC.NAV_POPOVER_DEFAULT_APPLICATIONS.length; idx++) {
			var application = CC.NAV_POPOVER_DEFAULT_APPLICATIONS[idx];
			// Should we display the navigation item?
			var shouldDisplayCalculator = application.mShouldDisplayCalculator;
			if (!shouldDisplayCalculator()) continue;
			fragment.appendChild(buildSection(application.mURL, application.mIdentifier, application.mDisplayTitle, application.mTooltip));
			// If this application is the active application, draw the navigation items.
			if (this.mActiveApplicationIdentifier == application.mIdentifier) {
				for (var jdx = 0; jdx < this.mNavigationItems.length; jdx++) {
					var navigationItem = this.mNavigationItems[jdx];
					var navigationItemElement = buildSection(navigationItem[0], navigationItem[1], navigationItem[2], navigationItem[3], true);
					fragment.appendChild(navigationItemElement);
				}
			}
		}
		return fragment;
	},
	makeAccessible: function() { 
		for (var jdx = 0; jdx < this.mNavigationItems.length; jdx++) {
			var navicationItem = this.mNavigationItems[jdx];
		}
	},
	show: function($super) {
		$super();
	},
	onAnchorClick: function(e) {
		e.stop();
		this.toggle();
	},
	handleKeyboardNotification: function($super, inMessage, inObject, inOptExtras) {
		switch (inMessage) {
		case CC.Keyboard.NOTIFICATION_DID_KEYBOARD_SHIFT_ESC:
			if (!this.visible)
				this.show();
			return true;
		default:
			break;
		}
		$super(inMessage, inObject, inOptExtras);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// A unified way of displaying notification messages.

CC.Notifier = CC.Notifier || new Object();

// Allowed notification states.

CC.Notifier.NORMAL_STATE = 'normal';
CC.Notifier.BUSY_STATE = 'busy';
CC.Notifier.FAILED_STATE = 'failed';
CC.Notifier.SUCCEEDED_STATE = 'succeeded';

// Model class for a queued notification.

CC.Notifier.Notification = Class.create({
	mDisplayString: null,
	mDisplayParams: null,
	mState: CC.NOTIFIER_MESSAGE_STATE_NORMAL,
	initialize: function(/* [inOptions] */) {
		if (arguments.length > 0 && arguments[0]) Object.extend(this, arguments[0]);
		return this;
	},
	// Private.
	mCompleted: false
});

// Global notifier shared instance.

CC.Notifier.DID_QUEUE_NOTIFICATION = 'DID_QUEUE_NOTIFICATION';
CC.Notifier.DID_UPDATE_NOTIFICATION = 'DID_UPDATE_NOTIFICATION';

var Notifier = Class.createWithSharedInstance('notifier');
Notifier.prototype = {
	// Track the current queue of notifications.
	mNotificationQueue: new Array(),
	// Track all registered notifications.
	mNotifications: new Hash(),
	// Track the currently dispatched notification.
	mActiveNotification: null,
	mNextNotificationIdentifer: 0,
	mTimeout: 1500,
	mFinalDelay: 3000,
	mShowNotifications: false,
	mShowErrorNotifications: true,
	initialize: function() {
		this.render();
		globalNotificationCenter().subscribe(CC.Notifier.DID_QUEUE_NOTIFICATION, this.dispatchNotification.bind(this));
		globalNotificationCenter().subscribe(CC.Notifier.DID_UPDATE_NOTIFICATION, this.updateAndDispatch.bind(this));
		this._initializeInlineContent();
	},
	// Initializes any inline flash messages from the server on load.
	_initializeInlineContent: function() {
		var payload = $('notifier');
		if (!payload) return;
		var alert = payload.down('.alert').innerHTML;
		var notice = payload.down('.notice').innerHTML;
		if (alert && alert != "") this.queueNotificationWithParams(error, undefined, CC.Notifier.FAILED_STATE);
		if (notice && notice != "") this.queueNotificationWithParams(notice);
	},
	// Renders and appends the notification chrome.
	render: function() {
		this.mParentElement = Builder.node('div', {className: 'notifier hidden'}, [
			Builder.node('div', {className: 'content'})
		]);
		document.body.appendChild(this.mParentElement);
	},
	redraw: function() {
		var active = this.mActiveNotification;
		if (!active || !active.mDisplayString) return;
		var displayString = active.mDisplayString;
		var localized = displayString.loc.apply(displayString, active.mDisplayParams || []);
		// Update the display string.
		this.mParentElement.down('.content').innerHTML = localized;
		// Update the state.
		var state = active.mState || CC.Notifier.NORMAL_STATE;
		['normal', 'busy', 'failed', 'succeeded'].each(function(klass) {
			this.mParentElement.removeClassName(klass);
		}, this);
		this.mParentElement.addClassName(state);
	},
	// Hide/show the notification widget. Uses CSS transitions for animation.
	hide: function() {
		this.mParentElement.addClassName('hidden');
	},
	show: function() {
		if (browser().isMobileSafari()) {
			var notification = this.mActiveNotification;
			var displayString = notification.mDisplayString;
			var localized = displayString.loc.apply(displayString, notification.mDisplayParams || []);
			alert(localized);
		} else {
			this.mParentElement.show();
			setTimeout(function() {
				this.redraw();
				this.mParentElement.removeClassName('hidden');
			}.bind(this), 250);
		}
	},
	// Queues a simple notification.
	printMessage: function(inString) {
		return this.queueNotificationWithParams(inString);
	},
	// Queues a simple error notification.
	printErrorMessage: function(inString) {
		var result = this.queueNotificationWithParams(inString, undefined, CC.Notifier.FAILED_STATE);
		return result;
	},
	printBusyMessage: function(inString) {
		return this.queueNotificationWithParams(inString, undefined, CC.Notifier.BUSY_STATE);
	},
	// Pushes a new notification onto the notification queue to be displayed at
	// the next available opportunity. Returns undefined where a notification
	// could not be added, or a notification identifer where the notification was
	// successfully queued. You can use the notification identifer to cancel or
	// update the notification later.
	queueNotification: function(inNotification) {
		if (!inNotification) return undefined;
		var identifier = this.mNextNotificationIdentifer;
		this.mNotifications.set(this.mNextNotificationIdentifer, inNotification);
		this.mNotificationQueue.push(inNotification);
		this.mNextNotificationIdentifer += 1;
		globalNotificationCenter().publish(CC.Notifier.DID_QUEUE_NOTIFICATION, inNotification);
		return identifier;
	},
	queueNotificationWithParams: function(inDisplayString, inDisplayParams, inState) {
		if (inState != CC.Notifier.FAILED_STATE && !this.mShowNotifications) return;
		if (inState == CC.Notifier.FAILED_STATE && !this.mShowErrorNotifications) return;
		var notification = new CC.Notifier.Notification({
			mDisplayString: inDisplayString,
			mDisplayParams: inDisplayParams,
			mState: inState
		});
		return this.queueNotification(notification);
	},
	// Updates an existing notification in the notification queue. Expects a
	// valid notification identifier (returned by addNotification) and a hash
	// of attribute changes. Allowed attributes are mDisplayString,
	// mDisplayParams and mState.
	updateNotification: function(inNotificationID, inUpdates) {
		if (inNotificationID == undefined || !this.mNotifications.get(inNotificationID) || !inUpdates) return false;
		var notification = this.mNotifications.get(inNotificationID);
		if (notification == this.mActiveNotification) this._pendingUpdate = true;
		Object.extend(notification, inUpdates);
		globalNotificationCenter().publish(CC.Notifier.DID_UPDATE_NOTIFICATION, notification, {
			notificationID: inNotificationID,
			updates: inUpdates
		});
		return true;
	},
	// Dispatches the first queued notification.
	dispatchNotification: function() {
		// Dispatch later if a change is-a-pending.
		if (this._pendingUpdate) {
			if (this.mDispatchTimeout) clearTimeout(this.mDispatchTimeout);
			this.mDispatchTimeout = setTimeout(function() {
				this._pendingUpdate = false;
				this._dispatch();
			}.bind(this), this.mTimeout);
		}
		// Dispatch later if we're already dispatching.
		if (this._dispatching) return;
		// Otherwise dispatch.
		this._dispatching = true;
		var queue = this.mNotificationQueue;
		// Mark any in-progress notifications as done.
		var active = this.mActiveNotification;
		if (active) active.mCompleted = true;
		// Pop the next notification in the queue.
		var notification = queue.shift();
		// Bail if the queue was actually empty.
		if (!notification && queue.length == 0) {
			this._dispatching = false;
			// Delay hiding the last notification.
			if (this.mTimer) clearTimeout(this.mTimer);
			this.mTimer = setTimeout(function() {
				this.hide();
				setTimeout(function() {
					this.mParentElement.hide();
				}.bind(this), 400);
			}.bind(this), this.mFinalDelay);
			return;
		}
		// Cache and recurse.
		if (notification) this.mActiveNotification = notification;
		this.hide();
		this.show();
		if (this.mTimer) clearTimeout(this.mTimer);
		this.mTimer = setTimeout(this._dispatch.bind(this), this.mTimeout);
	},
	updateAndDispatch: function() {
		this.redraw();
		this.dispatchNotification();
	},
	_dispatch: function() {
		// It's safe to dispatch if we're not pending an update or busy.
		var pending = this._pendingUpdate == undefined ? false : this._pendingUpdate;
		var busy = (this.mActiveNotification && (this.mActiveNotification.mState == CC.Notifier.BUSY_STATE));
		if (busy) this._pendingUpdate = true;
		if (!pending && !busy) this._dispatching = false;
		this.dispatchNotification();
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// A view that behaves as a panel inside a panel set.

CC.PanelView = Class.create(CC.Mvc.View, {
	getParent: function() {
		return this._parent;
	},
	setParent: function(parent) {
		this._parent = parent;
	},
	select: function() {
		this.getParent().select(this);
	},
	isSelected: function() {
		return (this.getParent().selected() == this);
	},
	setVisible: function($super, inShouldBeVisible) {
		$super(inShouldBeVisible);
		var field = this.$().down('input[type="text"], textarea');
		if (field) field.focus();
	}
});

// A class for a set of ordered views (that include the CC.PanelMixin mixin).

CC.PanelSet = Class.create({
	_panels: null,
	_selected: null,
	initialize: function() {
		this._panels = [];
	},
	add: function(panel) {
		panel.setParent(this);
		this._panels.push(panel);
	},
	remove: function(panel) {
		panel.setParent(null);
		this._panels = this._panels.without(panel);
	},
	select: function(panel) {
		this._panels.each(function(p) {
			p.setVisible(p == panel);
		});
		this._selected = panel;
	},
	first: function() { return this._panels.first(); },
	last: function() { return this._panels.last(); },
	all: function() { return this._panels; },
	selected: function() { return this._selected; },
	previous: function() { return this._selectedOffset(-1); },
	next: function() { return this._selectedOffset(1); },
	itemAtIndex: function(idx) { return this._panels[idx]; },
	_selectedOffset: function(offset) {
		var firstIdx  = 0;
		var lastIdx   = this._panels.length - 1;
		var offsetIdx = this._panels.indexOf(this.selected()) + offset;
		if (offsetIdx < firstIdx) {
			offsetIdx = lastIdx;
		} else if (offsetIdx > lastIdx) {
			offsetIdx = firstIdx;
		}
		return this._panels[offsetIdx];
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Polite login reminder shared instance.

CC.PoliteLoginPrompt = Class.create({
	initialize: function() {
		this.updateDisplayState();
		
		// Automatically update when meta tags change
		globalNotificationCenter().subscribe(CC.Meta.NOTIFICATION_DID_REFRESH_META_TAGS, this.updateDisplayState.bind(this));
	},
	showPoliteLoginPrompt: function() {
		if (!this.mElement) {
			this.mElement = Builder.node('div', {id:'polite_login'});
			var currentURL = window.location;
			var destinationString = "/auth?send_token=no&redirect="+currentURL;
			this.mElement.innerHTML = '_PoliteLogin.Format'.loc('<a href="'+destinationString+'">'+'_PoliteLogin.LogIn'.loc()+'</a><span class="dismiss"></span>');

			this.mElement.down('a').addEventListener('click', function(e) {
				e.preventDefault();

				if ( browser().isiPhone() ) {
					window.location = destinationString;
					return;
				}

				this.hidePoliteLoginPrompt(true);
				authenticator().displayFramedLoginPrompt(function(){
					window.location.reload();
				});
			}.bind(this), false);
			document.body.appendChild(this.mElement);
			this.mElement.down('.dismiss').observe('click', this.hidePoliteLoginPrompt.bindAsEventListener(this));
		}
	},
	hidePoliteLoginPrompt: function(inOptSuppressCookie) {
		if (this.mElement) {
			this.mElement.remove();
			delete this.mElement;
		}
		if (inOptSuppressCookie !== true) {
			globalCookieManager().setCookie('cc.hide_polite_login', true);
		}
	},
	updateDisplayState: function() {
		var loggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		var hideCookie = globalCookieManager().getCookie('cc.hide_polite_login');
		if (loggedIn) {
			// Destroy the cookie so the next time we're logged out it will appear.
			globalCookieManager().destroyCookie('cc.hide_polite_login');
		}
		// If the user is not logged in and hasn't explicitly set the hide cookie, show the
		// polite login prompt.
		if (!loggedIn && !hideCookie) {
			this.showPoliteLoginPrompt();
		} else {
			this.hidePoliteLoginPrompt(true);
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Individual result count view.

CC.XcodeServer.ResultCountView = function() {
	var elem = document.createElement('div');
	var status = document.createElement('div');
	status.className = 'status';
	var header = document.createElement('h1');
	var subHeader = document.createElement('h2');
	var subSubHeader = document.createElement('h3');
	elem.appendChild(status);
	elem.appendChild(header);
	elem.appendChild(subHeader);
	elem.appendChild(subSubHeader);
	this.mParentElement = elem;
	this.setCountType();
};

CC.XcodeServer.ResultCountView.prototype.setCountValue = function(inCountValue) {
	var count = (inCountValue != undefined ? inCountValue : -1);
	var header = this.mParentElement.getElementsByTagName('h1').item(0);
	var headerClassName = "";
	if (count > 9) headerClassName = "twodigits";
	if (count > 99) headerClassName = "threedigits";
	if (count > 999) headerClassName = "fourdigits";
	if (count > 9999) {
		headerClassName = "fivedigits";
		count = "9999+";
	}
	header.className = headerClassName;
	header.innerHTML = "";
	header.appendChild(document.createTextNode(count));
	header.setAttribute('data-text', count);
};

CC.XcodeServer.ResultCountView.prototype.setCountType = function(inCountType) {
	this.mParentElement.className = 'xc-result-count-view' + (inCountType != undefined ? " " + inCountType : "");
};

CC.XcodeServer.ResultCountView.prototype.setSubHeader = function(inSubHeader) {
	var subHeader = this.mParentElement.getElementsByTagName('h2').item(0);
	subHeader.innerHTML = "";
	subHeader.appendChild(document.createTextNode(inSubHeader));
};

CC.XcodeServer.ResultCountView.prototype.setSubSubHeader = function(inSubSubHeader) {
	var subSubHeader = this.mParentElement.getElementsByTagName('h3').item(0);
	subSubHeader.innerHTML = "";
	subSubHeader.appendChild(document.createTextNode(inSubSubHeader));
};

CC.XcodeServer.ResultCountView.prototype.setVisible = function(inShouldBeVisible) {
	if (inShouldBeVisible == undefined || inShouldBeVisible) {
		this.mParentElement.style.display = 'inline-block';
	} else {
		this.mParentElement.style.display = 'none';
	}
};

// Result count banner view.  Displays a line-up of issues, warnings and analysis errors, combined with
// total tests that have passed and failed, handling all the logic behind hiding/showing specific counts
// as needed.

CC.XcodeServer.RESULT_COUNT_BANNER_VIEW_TYPES = ["No Issues", "Warnings", "Analysis", "Errors", "Tests Succeeded", "Tests Failed"];

CC.XcodeServer.ResultCountBannerView = function() {
	var elem = document.createElement('div');
	elem.className = 'xc-grouped-result-count-view';
	// Start by initializing four sub-views for each of the counts we will potentially display.
	this.mResultCountViews = {};
	var types = CC.XcodeServer.RESULT_COUNT_BANNER_VIEW_TYPES;
	for (var idx = 0; idx < 6; idx++) {
		var countView = new CC.XcodeServer.ResultCountView();
		countView.setVisible(false);
		var countType = types[idx];
		countView.setCountType(countType.toLowerCase().replace(/ /g,''));
		countView.setSubHeader(countType);
		this.mResultCountViews[countType] = countView;
		elem.appendChild(countView.mParentElement);
	}
	this.mParentElement = elem;
};

CC.XcodeServer.ResultCountBannerView.prototype.updateCounts = function(inWarningsCount, inAnalysisCounts, inErrorsCount, inTotalTestCount, inPassedTestsCount, inFailedTestsCount) {
	// For each of the counts we got passed, update the count view regardless of whether we will
	// actually show the count to the user.
	var types = CC.XcodeServer.RESULT_COUNT_BANNER_VIEW_TYPES;
	var noIssuesView = this.mResultCountViews[types[0]];
	var warningsView = this.mResultCountViews[types[1]];
	var analysisView = this.mResultCountViews[types[2]];
	var errorsView = this.mResultCountViews[types[3]];
	var passedTestsView = this.mResultCountViews[types[4]];
	var failedTestsView = this.mResultCountViews[types[5]];
	noIssuesView.setCountValue("✓");
	warningsView.setCountValue(inWarningsCount);
	analysisView.setCountValue(inAnalysisCounts);
	errorsView.setCountValue(inErrorsCount);
	passedTestsView.setCountValue(inPassedTestsCount);
	failedTestsView.setCountValue(inFailedTestsCount);
	// Show everything.
	noIssuesView.setVisible(true);
	warningsView.setVisible(true);
	analysisView.setVisible(true);
	errorsView.setVisible(true);
	passedTestsView.setVisible(true);
	failedTestsView.setVisible(true);
	// If we don't have any tests, we hide all test results counts. If we have more than zero failed
	// we show a failed test count and hide any passed tests, and if have no failing tests we show a
	// passing test count (which should be 100% unless tests were skipped).
	if (!inTotalTestCount) {
		passedTestsView.setVisible(false);
		failedTestsView.setVisible(false);
	} else if (inFailedTestsCount) {
		var subTitle = types[5];
		var subSubTitle = inFailedTestsCount + " of " + inTotalTestCount + " tests (" + Math.round((inFailedTestsCount / inTotalTestCount) * 100) + "%)";
		failedTestsView.setSubHeader(subTitle);
		failedTestsView.setSubSubHeader(subSubTitle);
		passedTestsView.setVisible(false);
	} else if (inPassedTestsCount) {
		var subTitle = types[4];
		var subSubTitle = inPassedTestsCount + " of " + inTotalTestCount + " tests (" + Math.round((inPassedTestsCount / inTotalTestCount) * 100) + "%)";
		passedTestsView.setSubHeader(subTitle);
		passedTestsView.setSubSubHeader(subSubTitle);
		failedTestsView.setVisible(false);
	}
	// Only show warnings, analysis and errors if we have any.
	if (!inWarningsCount) warningsView.setVisible(false);
	if (!inAnalysisCounts) analysisView.setVisible(false);
	if (!inErrorsCount) errorsView.setVisible(false);
	// If we have no warnings, analysis issues or errors, show a no-issues placeholder.
	if (!inWarningsCount && !inAnalysisCounts && !inErrorsCount) {
		noIssuesView.setVisible(true);
	} else {
		noIssuesView.setVisible(false);
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.




CC.Search = CC.Search || new Object();

// Create a custom filter bar so we can sort by rank too.

CC.Search.CustomFilterBarViewFilters = $H({
	'rank': '-rank',
	'title': '+longName',
	'mostRecent': '-lastActivityTime',
	'leastRecent': '+lastActivityTime'
});

CC.Search.ReverseCustomFilterBarViewFilters = $H({
	'-rank': 'rank',
	'+longName': 'title',
	'-lastActivityTime': 'mostRecent',
	'+lastActivityTime': 'leastRecent'
});

CC.Search.PaginatingSearchResultsFilterBarView = Class.create(CC.FilterBarView, {
	mSortKey: '-rank',
	_mSortKey: 'rank',
	mAllowedFilters: CC.PAGINATING_SEARCH_QUERY_LIST_ALLOWED_FILTERS,
	mAllowedSortKeys: CC.Search.CustomFilterBarViewFilters,
	mAllowSavingSearch: true
});

// Paginating search results view.

CC.Search.PaginatingSearchResultsView = Class.create(CC.PaginatingSearchQueryListView, {
	mFilterBarViewClass: 'CC.Search.PaginatingSearchResultsFilterBarView',
	// Override the pagination callback so we can append a save search button. We do it here because
	// we're accessing the sessions global and need to be sure the session information is there (which
	// it may not be until at least one collabdproxy request has been made).
	defaultPaginationCallback: function($super, inResults, inStartIndex, inTotal, inPaginationGUID) {
		$super(inResults, inStartIndex, inTotal, inPaginationGUID);
		sessions().currentUserAsynchronously(function(user) {
			if (user && user.isAuthenticated) {
				if (!this.$().down('.cc-save-search-button')) {
					var savedSearchButton = Builder.node('a', {className:'cc-save-search-button cc-filter-bar-right-button'}, "_Search.SavedSearch.Save".loc());
					Event.observe(savedSearchButton, 'click', this.handleSaveSearchButtonClicked.bind(this));
					Element.insert(this.$().down('.section.last'), {'top': savedSearchButton});
				}
			}
		}.bind(this));
	},
	renderResultItem: function(inResultItem) {
		var entity = inResultItem;
		if (!entity) return;
		var isFavorite = entity.isFavorite ? entity.isFavorite : false;
		var iconURI = iconURIForEntity(inResultItem, true);
		var elem = Builder.node('div', {'role': 'presentation', className: 'cc-search-item'}, [
			Builder.node('div', {'role': 'presentation', className: 'cc-search-item-entity', 'data-guid': entity.guid, 'data-snippets': JSON.stringify(entity.snippets || {})}, [
				Builder.node('a', {'role': 'checkbox', 'href': '#', 'className': 'cc-entity-favorite-toggle' + (isFavorite ? ' selected' : ''), 'data-guid': entity.guid, 'title': "_General.Favorite.Toggle.Title".loc()}),
				Builder.node('span', {'role': 'presentation', 'className': 'modtime ellipsis'}),
				Builder.node('span', {'role': 'presentation', 'className': 'cc-entity-icon', 'style': 'background-image: url(%@); background-size: 32px 32px;'.fmt(iconURI)}, [
					Builder.node('img', {'role': 'presentation', 'src': (iconURI || "")})
				]),
				Builder.node('span', {'role': 'presentation', 'className': 'title ellipsis'}),
				Builder.node('span', {'role': 'presentation', 'className': 'owner ellipsis'}),
				Builder.node('div', {className:'cc-search-item-snippet-content'}),
				Builder.node('div', {className:'cc-search-item-snippet-tags'})
			])
		]);
		elem.select('.cc-entity-favorite-toggle').each(function(toggle) {
			new CC.EntityFavoriteToggle(toggle);
		});
		// Handle a title snippet up-front so we can use it to localize.
		var entityTitle = (entity.longName || entity.shortName).escapeHTML();
		if (entity.snippets) {
			var titleSnippet = (entity.snippets['longName'] || entity.snippets['shortName']);
			if (titleSnippet) {
				entityTitle = this.__wrapSnippetInHighlightTags(titleSnippet.escapeHTML());
			}
		}
		// Render the titles and last modified timestamp.
		var entityLink = "<a href='%@'>%@</a>".fmt(CC.entityURL(entity, true), entityTitle);
		elem.down('span.title').innerHTML = entityLink;
		var ownerLink = "<a href='%@'>%@</a>".fmt(CC.entityURL(entity.container, true), (entity.container.longName || entity.container.shortName).escapeHTML());
		elem.down('span.owner').innerHTML = "_Search.Owner.Title.Format".loc(ownerLink);
		var userLink = "<a href='%@'>%@</a>".fmt(CC.entityURL(entity.updatedByUser, true), (entity.updatedByUser.longName || entity.updatedByUser.shortName).escapeHTML());
		elem.down('span.modtime').innerHTML = "_Search.LastModified.Subtitle.Format".loc(globalLocalizationManager().localizedDateTime(entity.lastActivityTime || entity.createTime), userLink);
		// Handle content and tag snippets.
		if (entity.snippets) {
			var contentSnippet = (entity.snippets['extendedAttributes.pageTextValue'] || entity.snippets['content']);
			// HTML snippets are annotated html fragments with {{{ snippet decorations.
			var htmlSnippet = entity.snippets['extendedAttributes.renderedPage'];
			if (!contentSnippet && htmlSnippet) {
				var tempNode = document.createElement("div");
				// If htmlSnippet is an array, we need to join them to get one string.
				if (Object.isArray(htmlSnippet)) htmlSnippet = htmlSnippet.join("_Search.MultipleSnippet.Divider".loc());
				tempNode.innerHTML = htmlSnippet;
				contentSnippet = tempNode.textContent || tempNode.innerText;
			}
			if (contentSnippet) {
				elem.down('.cc-search-item-snippet-content').innerHTML = this.__wrapSnippetInHighlightTags(contentSnippet);
			}
			var tagsSnippet = entity.snippets['tags'];
			if (tagsSnippet) {
				// When one tag matched, the snippet is a string, otherwise it's an array.  Always work with arrays.
				if (!Object.isArray(tagsSnippet)) tagsSnippet = [tagsSnippet];
				// Always show all tags.  Build a list of all tags interleaved with matching tag snippets.
				var allTags = $A(entity.tags || []);
				// First sort the original tags alphabetically (case insensitive).
				var sortedTags = allTags.sortBy(function(n) { return n.toLowerCase(); });
				for (var i = 0; i < sortedTags.length; i++) {
					sortedTags[i] = sortedTags[i].escapeHTML();
				}
				
				var tag, originalTag, sortedTagIndex;
				for (var tdx = 0; tdx < tagsSnippet.length; tdx++) {
					// Get the original unwrapped tag.
					tag = tagsSnippet[tdx];
					originalTag = tag.replace(/{{{|}}}/g, '');
					// Replace the original tag with an annotated version.
					sortedTagIndex = sortedTags.indexOf(originalTag);
					if (sortedTagIndex != -1) {
						sortedTags[sortedTagIndex] = this.__wrapSnippetInHighlightTags(tag);
					}
				}
				// Build out the tags list.
				elem.down('.cc-search-item-snippet-tags').innerHTML = "<span>%@</span>&nbsp;&nbsp;%@".fmt("_Search.Tags.Subtitle".loc(), sortedTags.join("&nbsp;&nbsp;"));
			}
		}
		return elem;
	},
	__wrapSnippetInHighlightTags: function(inSnippet) {
		var snippets = (Object.isArray(inSnippet) ? inSnippet : [inSnippet]), s, result = [];
		for (var sdx = 0; sdx < snippets.length; sdx++) {
			s = snippets[sdx];
			result.push(s.replace(/{{{/g, '<span class="highlight">').replace(/}}}/g, '</span>'));
		}
		return result.join("_Search.MultipleSnippet.Divider".loc());
	},
	handleSaveSearchButtonClicked:function(inEvent) {
		if (!$('save_search_dialog')) {
			dialogManager().drawDialog('save_search_dialog', [
				{ label: "_Search.SavedSearch.Save.Dialog.Label".loc(), contents: '<input type="text" id="save_search_dialog_input" />' },
			], "_Search.SavedSearch.Save.Dialog.OK".loc(), false, "_Search.SavedSearch.Save.Dialog.Title".loc(), "_Dialogs.Cancel".loc());
		}
		var input = $('save_search_dialog_input');
		var callback = function() {
			dialogManager().hide();
			dialogManager().showProgressMessage("_Search.SavedSearch.Save.Dialog.Progress".loc());
			var name = input.value;
			var query = this.buildQuery();
			return server_proxy().saveQueryAsSavedSearchWithName(query, name, this.handleDidSaveSearch.bind(this), this.handleDidSaveSearch.bind(this));
		}
		input.value = (this.mFilterBarView.mKeyword || "_Search.SavedSearch.Untitled".loc());
		dialogManager().show('save_search_dialog', null, callback.bind(this), null, input);
	},
	handleDidSaveSearch: function(inResponse) {
		dialogManager().hide();
		if (inResponse && inResponse.succeeded) {
			this.mParentElement.down('.cc-save-search-button').hide();
			// Publish a notification to say the search saved.
			globalNotificationCenter().publish(CC.SEARCH_VIEW_DID_SAVE_SEARCH, this);
		}
	}
});

CC.Search.queryToURL = function(inQuery) {
	// utility method for munging from a query to url parameters...
	var onlyDeleted = inQuery.onlyDeleted;
	// go through the actual query and snarf out what we can
	var keywords = [];
	var tags = [];
	var favoritesOnly = false;
	var sortKeys = [];
	// assume it's an and node for now
	$A(inQuery.query.and).each(function(aNode) { 
		if (aNode.field) {
			if (aNode.field == "isFavorite") {
				favoritesOnly = aNode.match;
			}
			if (aNode.field == "tags") {
				tags.push(aNode.value);
			}
		} else {
			if (aNode.value) {
				// assume it's a keyword search
				keywords.push(aNode.value);
			}
			if (aNode.match) {
				keywords.push(aNode.match);
			}
		}
	});
	$A(inQuery.sortFields).each(function(aSortKey) {
		sortKeys.push(aSortKey);
	});
	
	// now construct the query string based on the values we've snarfed
	var queryString = "/find?";
	if (keywords.length > 0) {
		queryString = queryString + "keyword=" + keywords.join("&keyword=");
	}
	if (tags.length > 0) {
		if (keywords.length > 0) {
			queryString = queryString + "&";
		}
		queryString = queryString + "tags=" + tags.join("&tags=");
	}
	if (favoritesOnly) {
		if (tags.length || keywords.length) {
			queryString = queryString + "&";
		}
		queryString = queryString + "favorites_only=true";
	}
	if (sortKeys.length > 0) {
		if (favoritesOnly || tags.length || keywords.length) {
			queryString = queryString + "&";
		}
		queryString = queryString + "sortKey=" + sortKeys.join("&sortKey=");
	}
	return queryString;
};

// Helper function that updates a CC.FilterBarView with a set of URL query params.
// Note that it bypasses the setters for the view deliberately so it can be used to
// set up initial state.

CC.Search.setupFilterForQuery = function(filter, params) {
	if (params['favorites_only'] == 'true') {
		filter.setFilter('favorites');
	} else if (params['deleted_only'] == 'true') {
		filter.setFilter('deleted')
	} else {
		filter.setFilter('everything');
	}
	if (params['sortKey']) {
		var aSortKey = CC.Search.ReverseCustomFilterBarViewFilters.get(params['sortKey']);
		if (aSortKey) {
			filter.setSortKey(aSortKey);
		}
	} else {
		filter.setSortKey('mostRecent');
	}
	if (!params['sortKey']) {
		filter.setSortKey('rank');
	}
	filter.setTags(params['tags']);
	filter.setKeyword(params['keyword']);
};

CC.Search.translateOldQueryParamsToNew = function() {
	var queryString = "/find?";
	var queryParams = [];
	// old urls are in the form ?q[keyword]=test&q[tags][]=find&q[tags][]=hot&q[owners][]=
	// or q[deleted_only]=false&q[favorites_only]=true&q[how_many]=25&q[keyword]=&q[mine_only]=false&q[owners][]=&q[sort_direction]=desc&q[sort_property]=rank&q[start_index]=0&q[tags][]=tag&q[unread_only]=false&q[watched_only]=false
	// we only care about keyword, tags, favorites_only, sort_property, sort_direction, tags, owners
	var params = CC.params();
	if (params['q[keyword]']) {
		var keywords = Object.isArray(params['q[keyword]']) ? params['q[keyword]']: [params['q[keyword]']];
		queryParams.push("keyword="+keywords.join('&keyword='));
	}
	if (params['q[tags][]']) {
		var tags = Object.isArray(params['q[tags][]']) ? params['q[tags][]'] : [params['q[tags][]']];
		queryParams.push("tags="+params['q[tags][]'].join('&tags='));
	}
	if (params['q[owners][]']) {
		var owners = Object.isArray(params['q[owners][]']) ? params['q[owners][]'] : [params['q[owners][]']];
		queryParams.push("scopeGUID="+owners.join('&scopeGUID='));
	}
	if (params['q[deleted_only]']) {
		var deletedOnly = Object.isArray(params['q[deleted_only]']) ? params['q[deleted_only]'][0] : params['q[deleted_only]'];
		queryParams.push("deletedOnly="+deletedOnly);
	}
	if (params['q[favorites_only]']) {
		var favoritesOnly = Object.isArray(params['q[favorites_only]']) ? params['q[favorites_only]'][0] : params['q[favorites_only]'];
		queryParams.push("favoritesOnly="+favoritesOnly);
	}
	queryString = queryString + queryParams.join('&');
	
	return env().root_path + queryString;
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// A controlled explosion of smoke.

var Smokey = Class.createWithSharedInstance('smokey');
Smokey.prototype = {
	mWidth: 42,
	mHeight: 42,
	mPoofFrameDelay: 90,
	initialize: function() {
		this.mParentElement = document.createElement('div');
		Element.extend(this.mParentElement);
		this.mParentElement.addClassName('smokey').hide();
		document.body.appendChild(this.mParentElement);
	},
	showOverElement: function(elementId) {
		if (!elementId) return null;
		var element = $(elementId);
		if (!element) return null;
		if (element.getStyle('display') == "none") return null;
		Position.clone(element, this.mParentElement, {
			setWidth: false,
			setHeight: false,
			offsetLeft: (element.offsetWidth / 2) - (this.mWidth / 2),
			offsetTop: (element.offsetHeight / 2) - (this.mHeight / 2)
		});
		this.show();
	},
	showAtPosition: function(inPosition) {
		if (!inPosition || !inPosition.left || !inPosition.top) return null;
		this.mParentElement.setStyle({
			'left': inPosition.left + 'px',
			'top': inPosition.top + 'px'
		});
		this.show();
	},
	show: function() {
		this.mParentElement.show();
		this.mCurrentFrame = 0;
		if (this.mTimer) clearTimeout(this.mTimer);
		this.mTimer = setTimeout(this.handleTimerFired.bind(this), this.mPoofFrameDelay);
	},
	handleTimerFired: function() {
		if (this.mCurrentFrame < 5) {
			this.mCurrentFrame++;
			var x = this.mCurrentFrame * this.mHeight * (-1);
			this.mParentElement.style.backgroundPosition = '0px ' + x + 'px';
			this.mTimer = setTimeout(this.handleTimerFired.bind(this), this.mPoofFrameDelay);
		}
		else {
			this.mParentElement.hide();
			delete this.mTimer;
		}
	}	
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Simple stack view implementation. 

CC.StackedView = Class.create(CC.Mvc.View, {
	mClassName: 'cc-stacked-view',
	setContentViews: function(inContentViews) {
		for (var idx = 0; idx < inContentViews.length; idx++) {
			this.addSubview(inContentViews[idx]);
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Unit test pie chart.

CC.XcodeServer.UNIT_TEST_PIE_VIEW_PASS_COLOR = "#60C769";
CC.XcodeServer.UNIT_TEST_PIE_RING_WIDTH = 8;
CC.XcodeServer.UNIT_TEST_PIE_VIEW_FAIL_COLOR = "#F02724";
CC.XcodeServer.UNIT_TEST_PIE_VIEW_EMPTY_COLOR = "#F0F0F0";

CC.XcodeServer.UnitTestPieView = function(inTotalTestCount, inFailedTestCount, inWidth, inHeight) {
	var elem = document.createElement('div');
	elem.className = "xc-unit-test-pie-view";
	elem.style.width = inWidth + "px";
	elem.style.height = inHeight + "px";
	
	var canvas = document.createElement('canvas');
	canvas.style.width = inWidth + "px";
	canvas.style.height = inHeight + "px";
	canvas.width = inWidth;
	canvas.height = inHeight;
	var context = canvas.getContext('2d');
	
	// Figure out a scale factor for retina display.
	var scaleFactor = 1;
	if ('devicePixelRatio' in window) {
		scaleFactor = window.devicePixelRatio;
	}
	var backingStoreRatio = (context.webkitBackingStorePixelRatio ||
		context.mozBackingStorePixelRatio ||
		context.msBackingStorePixelRatio ||
		context.oBackingStorePixelRatio ||
		context.backingStorePixelRatio ||
		1);
	var scaleRatio = scaleFactor / backingStoreRatio;
	if (scaleFactor !== backingStoreRatio) {
		canvas.width = Math.floor(scaleRatio * inWidth);
		canvas.height = Math.floor(scaleRatio * inHeight);
		context.scale(scaleRatio, scaleRatio);
	}
	elem.appendChild(canvas);
	
	var size = {'width': inWidth, 'height': inHeight};
	var centerX = Math.floor(size.width / 2);
	var centerY = Math.floor(size.height / 2);
	var radius = Math.floor((size.width) / 2);
	var totalTestCount = (inTotalTestCount || 0);
	var failedTestCount = (inFailedTestCount || 0);
	
	context.save();
	
	if (inTotalTestCount > 0) {
		// Draw a full passing/failing doughnut ring first.
		var fillStyle = CC.XcodeServer.UNIT_TEST_PIE_VIEW_PASS_COLOR;
		if (failedTestCount == totalTestCount) {
			fillStyle = CC.XcodeServer.UNIT_TEST_PIE_VIEW_FAIL_COLOR;
		}
		context.beginPath();
		context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		context.fillStyle = fillStyle;
		context.fill();
		context.restore();
	
		context.save();
		context.beginPath();
		context.arc(centerX, centerY, radius - Math.floor(CC.XcodeServer.UNIT_TEST_PIE_RING_WIDTH / 2), 0, 2 * Math.PI, false);
		context.fillStyle = "#FFFFFF";
		context.fill();
		context.restore();
	
		// If we have any failing tests, draw a failing wedge.
		if (failedTestCount > 0 && failedTestCount != totalTestCount) {
			var failRatio = (failedTestCount / totalTestCount);
			var pieAngle = failRatio * 360;
			var startingAngle = 1.5 * Math.PI;
			var endingAngle = ((pieAngle - 90) * Math.PI / 180);
			context.lineWidth = 1;
			context.beginPath();
			context.fillStyle = CC.XcodeServer.UNIT_TEST_PIE_VIEW_FAIL_COLOR;
			context.lineWidth = 1;
			context.strokeStyle = "#FFFFFF";
			context.moveTo(centerX, centerY);
			context.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
			context.closePath();
			context.fill();
			context.stroke();
		}
	}
	else {
		context.beginPath();
		context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		context.fillStyle = CC.XcodeServer.UNIT_TEST_PIE_VIEW_EMPTY_COLOR;
		context.fill();
		context.restore();
		context.save();
		
		context.save();
		context.beginPath();
		context.arc(centerX, centerY, radius - Math.floor(CC.XcodeServer.UNIT_TEST_PIE_RING_WIDTH / 2), 0, 2 * Math.PI, false);
		context.fillStyle = "#FFFFFF";
		context.fill();
		context.restore();
	}
	
	
	this.mParentElement = elem;
	this.mCanvas = canvas;
};

CC.XcodeServer.UnitTestPieView.prototype.toDataUrl = function() {
	if ( this.mCanvas ) {
		return this.mCanvas.toDataURL();
	}
	else {
		return '';
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.DID_FAVORITE_ENTITY_NOTIFICATION = 'DID_FAVORITE_ENTITY';
CC.DID_UNFAVORITE_ENTITY_NOTIFICATION = 'DID_UNFAVORITE_ENTITY';
CC.DID_MARK_ENTITY_AS_READ_NOTIFICATION = 'DID_MARK_ENTITY_AS_READ';
CC.DID_MARK_ENTITY_AS_UNREAD_NOTIFICATION = 'DID_MARK_ENTITY_AS_UNREAD';

// Entity toggle base class.

CC.BaseEntityToggle = Class.create({
	initialize: function(element) {
		this.element = $(element);
		if (this.element.hasClassName('enabled')) return;
		this.element.addClassName('enabled');
		this.element.on(browser().isMobileSafari() ? 'touchstart' : 'mousedown', this.onElementClick.bindAsEventListener(this));
		this.setIsSelected(this.element.hasClassName('selected'), false);
	},
	onElementClick: function(e) {
		Event.stop(e);
		this.toggleIsSelected();
	},
	toggleIsSelected: function() {
		this.setIsSelected(!this.getIsSelected());
	},
	getIsSelected: function() {
		return this.element.hasClassName('selected');
	},
	setIsSelected: function(value, persist) {
		if (persist === undefined) persist = true;
		this.element.setClassName('selected', value);
		this.updateTooltip();
		if (persist) this.persistIsSelected();
	},
	updateTooltip: function() { /* Interface */ },
	persistIsSelected: function() { /* Interface */ }
});

CC.EntityFavoriteToggle = Class.create(CC.BaseEntityToggle, {
	persistIsSelected: function() {
		if (this.getIsSelected()) {
			server_proxy().addEntityToFavorites(this.element.getDataAttributes().guid, function() {
				globalNotificationCenter().publish(CC.DID_FAVORITE_ENTITY_NOTIFICATION, this, {'guid': this.element.getDataAttributes().guid});
			}.bind(this));
		} else {
			server_proxy().removeEntityFromFavorites(this.element.getDataAttributes().guid, function() {
				globalNotificationCenter().publish(CC.DID_UNFAVORITE_ENTITY_NOTIFICATION, this, {'guid': this.element.getDataAttributes().guid});
			}.bind(this));
		}
	}
});

CC.EntityUnreadToggle = Class.create(CC.BaseEntityToggle, {
	persistIsSelected: function() {
		if (this.getIsSelected()) {
			server_proxy().markEntityAsUnread(this.element.getDataAttributes().guid, function() {
				globalNotificationCenter().publish(CC.DID_MARK_ENTITY_AS_READ_NOTIFICATION, this, {'guid': this.element.getDataAttributes().guid});
			}.bind(this));
		} else {
			server_proxy().markEntityAsRead(this.element.getDataAttributes().guid, function() {
				globalNotificationCenter().publish(CC.DID_MARK_ENTITY_AS_UNREAD_NOTIFICATION, this, {'guid': this.element.getDataAttributes().guid});
			}.bind(this));
		}
	}
});

var SearchFieldBase = Class.create({
	mClickedItemCallback: null,
	mStartedItemSearchCallback: null,
	mSearchCancelledCallback: null,
	mResultTable: null,
	mPositionResults: true,
	mHeaderElement: null,
	mMinQueryChars: 1,
	mInterval: 500,
	mNumberOfEntries: 20,
	mSortKey: null,
	mTrapTabs: true,
	mShowPlaceholderStrings: false,
	mCaptureReturnChar: true,
	mSelectOnClick: true,
	initialize: function(inSearchField/*[, options]*/) {
		bindEventListeners(this, ['handleSafariSearch', 'handleKeypress', 'handleChanged', 'mousedOverUser', 'mousedOutUser', 'clickedUser']);
		this.mSearchField = $(inSearchField);
		if (arguments.length > 1) Object.extend(this, arguments[1]);
		if (!this.mResultTable) {
			this.mResultTable = Builder.node('table', {className:'search_field_results', style:'display:none'}, [
				Builder.node('tbody')
			]);
			d.body.appendChild(this.mResultTable);
		}
		this.mIsReallyTable = (this.mResultTable.nodeName.toLowerCase() == 'table');
		observeEvents(this, this.mSearchField, {keydown:'handleKeypress'});
		if (browser().isWebKit() && (this.mSearchField.type == 'search')) Event.observe(this.mSearchField, 'search', this.handleSafariSearch);
	},
	handleSafariSearch: function(e) {
		if (Event.element(e).value == '') this.runQuery(); // handle "x" button in search fields
	},
	handleKeypress: function(e) {
		switch (e.keyCode) {
			case Event.KEY_DOWN:
				this.suggestSibling('nextSibling');
				Event.stop(e);
				break;
			case Event.KEY_UP:
				this.suggestSibling('previousSibling');
				Event.stop(e);
				break;
			case Event.KEY_TAB:
			case Event.KEY_RETURN:
			case 188: // comma
				if (e.keyCode == Event.KEY_TAB && this.mSearchField.value == '') return true;
				if (e.keyCode == Event.KEY_RETURN && !this.mCaptureReturnChar) return true;
				this.handleChanged(e);
				if (e.keyCode == 188 || this.mTrapTabs) Event.stop(e);
				break;
			case Event.KEY_ESC:
				this.mSearchField.value = '';
				this.mLastQuery = null;
				this.mRows = null;
				if (this.mSearchCancelledCallback) this.mSearchCancelledCallback();
				break;
			default:
				if (!this.mTimer) this.mTimer = setTimeout(this.runQuery.bind(this), this.mInterval);
		}
	},
	handleChanged: function(e) {
		if (this.mSearchField.value != '') {
			this.selectSuggestedUID();
			Element.hide(this.mResultTable); // ##6410526
		}
	},
	suggestSibling: function(inKey) { // key = 'nextSibling' or 'previousSibling'
		var elm = $(this.mResultTable.id+'_'+(this.mSuggestedUID||''));
		if (elm && elm.parentNode[inKey]) {
			this.suggestUID(elm.parentNode[inKey].firstChild.dataSource.entityGUID);
		}
		else if ((!elm) && inKey == "nextSibling" && this.mRows && this.mRows.length > 0) {
			this.suggestUID(this.mRows[0].entityGUID);
		}
		// If we're at the first node, and we're keying up, deselect
		// the first item in the list and focus the input field.
		else if (inKey == 'previousSibling' && this.mSuggestedUID == this.mRows[0].entityGUID) {
			this.suggestUID(null);
		}
	},
	suggestUID: function(inUID) {
		Element.removeClassName(this.mResultTable.id+'_'+this.mSuggestedUID, 'suggested');
		this.mSuggestedUID = inUID;
		if (inUID) Element.addClassName(this.mResultTable.id+'_'+inUID, 'suggested');
	},
	selectSuggestedUID: function() {
		this.mChosenUID = this.mSuggestedUID;
		if (this.mChosenUID) {
			var chosenElm = $(this.mResultTable.id+'_'+this.mChosenUID);
			this.mChosenDataSource = chosenElm.dataSource;
			if (this.mPositionResults) {
				Element.hide(this.mResultTable);
				this.mSearchField.value = chosenElm.firstChild.nodeValue;
			}
			if (this.mClickedItemCallback) this.mClickedItemCallback(this.mChosenUID, this.mChosenDataSource.entityURL);
		}
		else if (!Element.hasClassName(this.mSearchField, 'hinted')) {
			if (this.mClickedItemCallback) this.mClickedItemCallback($F(this.mSearchField), null);
		}
		if (this.mTimer) {
			clearTimeout(this.mTimer);
			this.mTimer = null;
		}
	},
	mousedOverUser: function(e) {
		// superclass does nothing
	},
	mousedOutUser: function(e) {
		// superclass does nothing
	},
	clickedUser: function(e) {
		this.suggestUID(Event.findElement(e, (this.mIsReallyTable?'td':'a')).dataSource.entityGUID);
		if (this.mSelectOnClick) this.selectSuggestedUID();
	},
	constructQuery: function(inSearchString) {
		// subclasses should over-ride
	},
	runQuery: function() {
		if ($F(this.mSearchField) != this.mLastQuery) {
			this.mSuggestedUID = null;
			this.mRows = new Array();
			this.draw();
			if (this.mShowPlaceholderStrings) {
				// NOTE: not bothering with table code here because we don't use placeholder strings for tables
				replaceElementContents(this.mResultTable, Builder.node('li', {className:'search_placeholder busy_field'}, [Builder.node('a', {href:'#', onclick:invalidate}, "_Dialogs.LinkSearch.Progress.Searching".loc())]));
			}
			if (this.mPrefetch || ($F(this.mSearchField).length >= this.mMinQueryChars)) {
				Element.addClassName(this.mSearchField, 'busy_field');
				if (this.mStartedItemSearchCallback) this.mStartedItemSearchCallback();
				this.constructQuery($F(this.mSearchField));
			}
			else {
				this.mTimer = null;
				if (this.mSearchCancelledCallback) this.mSearchCancelledCallback();
			}
		}
		else {
			this.mTimer = null;
		}
		this.mLastQuery = $F(this.mSearchField);
	},
	gotSearchResult: function(inRequestObj, inResponseObj) {
		this.mRows = inResponseObj;
		if (this.mSortKey) Array.sortArrayUsingKey(this.mRows, this.mSortKey);
		if (this.mPrefetch && (!this.mCachedRows)) {
			this.mCachedRows = inResponseObj;
			Element.removeClassName(this.mSearchField, 'busy_field');
		}
		else {
			this.draw();
		}
		this.mTimer = null;
		this.runQuery(); // in case field changed while we were querying
		if (this.mSearchResultCallback) this.mSearchResultCallback(inResponseObj);
	},
	handleError: function(inFaultCode, inFaultString) {
		this.mTimer = null;
	},
	getDisplayString: function(inRow) {
		// subclasses should over-ride
	},
	updatePosition: function() {
		if (this.mPositionResults) {
			var cloneOptions = {setHeight:false, offsetTop:Element.getHeight(this.mSearchField)};
			Position.clone(this.mSearchField, this.mResultTable, cloneOptions);
		}
	},
	draw: function() {
		this.updatePosition();
		if (this.mPositionResults) Element.hide(this.mResultTable);
		if (this.mHeaderElement) Element.hide(this.mHeaderElement);
		removeAllChildNodes(this.mIsReallyTable ? this.mResultTable.firstChild : this.mResultTable);
		this.mSuggestedUID = null;
		if (this.mShowPlaceholderStrings && (this.mRows.length == 0)) {
			// NOTE: not bothering with table code here because we don't use placeholder strings for tables
			// also hacking hidden form value in here to avoid sending to another round of loc
			this.mResultTable.appendChild(Builder.node('li', [Builder.node('a', {href:'#', onclick:invalidate, className:'search_placeholder'}, $F('no_results_str'))]));
		}
		this.mRows.each(function(row) {
			row.displayString = this.getDisplayString(row);
			if (row.displayString != '') {
				if (this.mPositionResults) Element.show(this.mResultTable);
				if (this.mHeaderElement) Element.show(this.mHeaderElement);
				var currentCell = Builder.node((this.mIsReallyTable?'td':'a'), {id:this.mResultTable.id+'_'+row.entityGUID});
				currentCell.style.cursor = 'pointer';
				currentCell.dataSource = row;
				this.drawCell(currentCell);
				if (this.mIsReallyTable) {
					this.mResultTable.firstChild.appendChild(Builder.node('tr', [currentCell]));
				}
				else {
					currentCell.href = row.url;
					this.mResultTable.appendChild(Builder.node('li', [currentCell]));
				}
				observeEvents(this, currentCell, {click:'clickedUser', mouseover:'mousedOverUser', mouseout:'mousedOutUser'});
			}
		}.bind(this));
		Element.removeClassName(this.mSearchField, 'busy_field');
	},
	drawCell: function(inCell) {
		replaceElementContents(inCell, inCell.dataSource.displayString);
	}
});

var LinkSearchDialog = Class.create({
	mDialogTitle: "_Dialogs.LinkSearch.Title",
	mSearchFieldPlaceholder: "_Dialogs.LinkSearch.Search.Placeholder",
	mDialogDescription: "_Dialogs.LinkSearch.Description",
	mEntityTypes: ['com.apple.entity.Page', 'com.apple.entity.File'],
	mExcludedGUIDs: [],
	// An array of guids to exclude from search results.
	mExcludedGUIDs: null,
	initialize: function(/* [options] */) {
		if (arguments.length && arguments[0]) Object.extend(this, arguments[0]);
	},
	show: function(inAnchor, inCancelCallback, inOKCallback, inOptSearchString) {
		var tabIndexName = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_TO_WIKI_NAME);
		var tabIndexResult = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_MOVE_TO_WIKI_RESULT);
		
		var linkSearchDialog = $('link_search_dialog');
		if (linkSearchDialog) Element.remove(linkSearchDialog);
		dialogManager().drawDialog('link_search_dialog', [
			{contents:'<input tabindex="' + tabIndexName + '" role="textbox" type="'+(browser().isWebKit?'search':'text')+'" id="link_search_dialog_q" class="search_field" placeholder="'+(this.mSearchFieldPlaceholder || "").loc()+'"+"results="10" incremental>'},
			{contents:'<ul tabindex="' + tabIndexResult + '" role="list" aria-label="' + "_Accessibility.View.SearchResult".loc() + '" id="link_search_dialog_results"></ul>'}
		], "_Dialogs.LinkSearch.Button.OK".loc(), undefined, this.mDialogTitle.loc());
		// don't send the form when the user hits return
		$('link_search_dialog').down('form').onsubmit = invalidate;
		// hook up the search field
		this.mSearchField = new LinkSearchField('link_search_dialog_q', {
			mEntityTypes: this.mEntityTypes,
			mExcludedGUIDs: this.mExcludedGUIDs,
			mResultTable: $('link_search_dialog_results'),
			mClickedItemCallback: this.handleItemClick.bind(this)
		});
		var descriptionRow = Builder.node('tr', [
			Builder.node('td', {colSpan: 2, className: 'description'}, (this.mDialogDescription || "").loc())
		]);
		Element.insert($('link_search_dialog').down('tbody'), {top: descriptionRow});
		this.mCancelCallback = inCancelCallback;
		this.mOKCallback = inOKCallback;
		dialogManager().show('link_search_dialog', this.handleCancel.bind(this), this.handleOK.bind(this), $(inAnchor), undefined, 'link_search_dialog_q');
		if (inOptSearchString) {
			$('link_search_dialog_q').value = inOptSearchString;
			this.mSearchString = inOptSearchString;
			this.mSearchField.runQuery();
		}
		
		// Temporary disabling background items when modal dialog is open in order to avoid bad tabindex-ing
		accessibility().setRootViewsAriaHidden(true, false);
	},
	handleCancel: function() {				
		if (this.mCancelCallback) this.mCancelCallback();		
		
		// Bring background items back to foreground when closing modal dialog to bring back original tabindex-ing
		accessibility().setRootViewsAriaHidden(false, false);
	},
	handleOK: function() {
		this.mSearchField.selectSuggestedUID();
		var dataSource = (this.mSearchField.mChosenDataSource || {})
		if (this.mOKCallback) this.mOKCallback(dataSource.entityURL, (this.mSearchString || dataSource.entityLongName));
		delete this.mChosenUID;
		delete this.mChosenTitle;
		
		// Bring background items back to foreground when closing modal dialog to bring back original tabindex-ing
		accessibility().setRootViewsAriaHidden(false, false);				
	},
	handleItemClick: function(inDisplayString, inOptURL) {
		var dataSource = (this.mSearchField.mChosenDataSource || {});
		this.mChosenUID = dataSource.entityGUID;
		this.mChosenTitle = dataSource.entityLongName;
		return false;
	}
});

var LinkSearchField = Class.create(SearchFieldBase, {
	mEntityTypes: null,
	mExcludedGUIDs: null,
	mPositionResults: false,
	mCaptureReturnChar: true,
	mSelectOnClick: true,
	gotSearchResult: function(inRows) {
		this.mRows = (inRows || []);
		this.draw();
		this.mTimer = null;
	},
	getDisplayString: function(inRow) {
		return inRow.entityLongName || inRow.entityGUID;
	},
	clickedUser: function(e) {
		e.stop();
		this.suggestUID(Event.findElement(e, 'a').dataSource.entityGUID);
		return false;
	},
	constructQuery: function(inSearchString) {
		var searchString;
		if (inSearchString && inSearchString != "") searchString = inSearchString;
		var query = server_proxy().searchQuery(searchString, this.mEntityTypes, 0, 10);
		var callback = function(response) {
			if (response) {
				var r, rentity, rows = [];
				for (var rdx = 0; rdx < response.length; rdx++) {
					r = response[rdx];
					if (r && r.entity) {
						rentity = r.entity;
						if (this.mExcludedGUIDs && this.mExcludedGUIDs.length) {
							if (this.mExcludedGUIDs.indexOf(rentity.guid) > -1) continue;
						}
						rows.push({
							'entityGUID': rentity.guid,
							'entityType': rentity.type,
							'entityURL': CC.entityURL(rentity),
							'entityLongName': (rentity.longName || rentity.shortName)
						});
					}
				}
				return this.gotSearchResult(rows);
			}
			this.mTimer = null;
		}.bind(this);
		return server_proxy().entitiesForSearchQuery(query, callback, callback);
	},
	fieldChanged: function(e) {
		if (!this.mTimer) this.mTimer = setTimeout(this.runQuery.bind(this), this.mInterval);
	},
	handleChanged: function(e) {
		// statically displayed results table, so we shouldn't do the normal hiding stuff in this subclass
	}
});

var UserSearchField = Class.create(SearchFieldBase, {
	mSortKey: 'displayName',
	mValueKey: 'displayName',
	mMinQueryChars: 3,
	mSearchCancelledCallback: function() {
		this.mResultTable.hide();
	},
	filterTagInput: function(inTagName) {
		return inTagName.replace(/[\t\r\n]/g, ' ').replace(/^\s+/, '').replace(/\s+$/, '');
	},
	getDisplayString: function(inRow) {
		return inRow['entityUserLongName'] + ' (' + inRow['entityUserLogin'] + ')';
	},
	constructQuery: function(inSearchString) {
		if (!inSearchString) return;
		server_proxy().odRecordsMatching(inSearchString, this.gotSearchResult.bind(this), function() { this.mTimer = null; }.bind(this));
	},
	gotSearchResult: function(inResponse) {
		this.mRows = inResponse.collect(function(aRow) {
			var anItem = {
				entityUserLogin: aRow.login,
				entityUserLongName: (aRow.longName || aRow.login),
				entityGUID: aRow.externalID,
				url: "#"
			}
			return anItem;
		})
		this.draw();
		this.mTimer = null;
	},
	updatePosition: function($super) {
		$super();
		this.mResultTable.setStyle({
			'top': parseInt(this.mResultTable.getStyle('top'), 10) - 1 + 'px',
			'width': this.mResultTable.getWidth() - 4 + 'px'
		});
	}
});

var TagSearchField = Class.create(UserSearchField, {
	mSearchPath: '/tags/autocomplete',
	getDisplayString: function(inRow) {
		return inRow.entityGUID;
	},
	gotSearchResult: function(inResponse) {
		this.mRows = inResponse.responseJSON.each(function(row) { row.url = "#"; });
		this.draw();
		this.mTimer = null;
	},
	constructQuery: function(inSearchString) {
		if (!inSearchString) return;
		var url = "%@%@?keyword=%@".fmt(env().root_path, this.mSearchPath, inSearchString);
		return new Ajax.Request(url, {
			method: 'get',
			contentType: 'application/json',
			requestHeaders: { Accept: 'application/json' },
			onSuccess: this.gotSearchResult.bind(this),
			onFailure: function() { this.mTimer = null }.bind(this)
		});
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.Application = CC.Application || new Object();

// Some globals we'll want to reference later.

var rootView, rootViewController, sharedHeaderView, sharedNavPopover, sharedBannerView, mainView;

// Basic error message support.

var renderErrorMessage = function(inErrorMessage, inOptShowBanner) {
	if (sharedBannerView) sharedBannerView.setVisible(inOptShowBanner != undefined ? inOptShowBanner : false);
	CC.RouteHelpers.setContentSecondaryVisible(false, false);
	var view = new CC.ErrorMessageView({
		mErrorMessage: inErrorMessage
	});
	mainView.addSubview(view, '#content-primary', true);
};

var renderErrorHTML = function(inErrorHTML, inOptShowBanner) {
	if (sharedBannerView) sharedBannerView.setVisible(inOptShowBanner != undefined ? inOptShowBanner : false);
	CC.RouteHelpers.setContentSecondaryVisible(false, false);
	var view = new CC.ErrorMessageView({
		mErrorMessage: ""
	});
	view.forceRender();
	// This is safe because only we generate the supplied inner HTML.
	view.$('p').innerHTML = inErrorHTML;
	mainView.addSubview(view, '#content-primary', true);
};

// Base application class.

CC.Application = Class.create({
	mRoutesTriggerReload: true,
	mApplicationIdentifier: '',
	initialize: function(/* [options] */) {
		if (arguments && arguments.length > 0) Object.extend(this, arguments[0]);
		globalNotificationCenter().subscribe('PAGE_INITIALIZE_FINISHED', this.__initialize.bind(this));
	},
	// Internal function that is called to initialize this application. You should not
	// normally override this function.
	__initialize: function() {
		this.routeInitialRequestBeforeRender();
		this.__registerRoutes();
		this.createApplication();
	},
	// Called when the page is ready and the application will be created.
	createApplication: function() {
		// 9695664
		var dt = new Date();
		var offset = dt.getTimezoneOffset() / (-60);
		dt.setFullYear(dt.getFullYear() + 2);
		globalCookieManager().setCookie('cc.utc_offset', offset);
		// Routes should trigger a page reload on desktop.
		globalRouteHandler().mRoutesTriggerReload = this.mRoutesTriggerReload;
		// Write the locale to the body tag.
		document.body.addClassName(globalLocalizationManager().getLprojLocale());
		document.body.addClassName(this.mApplicationIdentifier);
		// Create a special root view and append it to the DOM so we have something to draw into.
		rootView = new CC.Mvc.View();
		rootView._render();
		var rootViewParentElement = rootView.mParentElement;
		rootViewParentElement.id = 'root';
		document.body.appendChild(rootViewParentElement);
		// Create the root view controller.
		rootViewController = new CC.Mvc.ViewController();
		rootViewController.mViewInstance = rootView;
	},
	// Your subclass should implement this function to return a tuple of route patterns and routing functions.
	// Note that routes should be returned in most to least specific order.
	computeRoutes: function() { /* Interface */ },
	// Internal function that registers routes computed above.
	__registerRoutes: function() {
		var routes = (this.computeRoutes() || []);
		var route, routePattern, routeFunction;
		for (var rdx = 0; rdx < routes.length; rdx++) {
			route = routes[rdx];
			routePattern = route[0];
			routeFunction = route[1];
			globalRouteHandler().register(routePattern, routeFunction);
		}
	},	
	// Routes the initial request by handle exceptions returned from the server (e.g. permission
	// denied or resource not found).  By default, looks for a route and routes it. You shouldn't
	// need to override this function unless you're doing something funky.  Remember to call this
	// function to have your application do anything.
	routeInitialRequestBeforeRender: function() {
		var exceptionName = CC.meta('x-apple-exception-name');
		var exceptionReason = CC.meta('x-apple-exception-reason');
		var loggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		if (exceptionName) {
			if (exceptionName == "CSPermissionDeniedError") {
				if (exceptionReason == "permission-denied") {
					if (!loggedIn) {
						var currentURL = window.location;
						window.location.href = "/auth?send_token=no&redirect=" + currentURL;
						return;
					}
				}
			}
		}
	},
	routeInitialRequestAfterRender: function() {
		var exceptionName = CC.meta('x-apple-exception-name');
		var exceptionReason = CC.meta('x-apple-exception-reason');
		// Is the entity/container/owner deleted?
		var ownerDeleted = (CC.meta('x-apple-owner-isDeleted') == "true")
		var containerDeleted = (CC.meta('x-apple-container-isDeleted') == "true");
		var entityDeleted = (CC.meta('x-apple-entity-isDeleted') == "true");
		var deletedGUID;
		if (ownerDeleted) {
			deletedGUID = CC.meta('x-apple-owner-guid');
		} else if (containerDeleted) {
			deletedGUID = CC.meta('x-apple-container-guid');
		} else if (entityDeleted) {
			deletedGUID = CC.meta('x-apple-entity-guid');
		}
		if (deletedGUID || (exceptionName == "CSPermissionDeniedError" && exceptionReason == "deleted")) {
			var canRestore = (CC.meta('x-apple-user-can-delete') == "true");
			var errorHTML = "<div>%@</div><div>%@</div>".loc("_Deleted.Placeholder.Title".loc(), "_Deleted.Placeholder.NoPermissions.Subtitle".loc());
			if (canRestore) {
				errorHTML = "<div>%@</div><div><a class=\"cc-restore-content-link\" data-guid=\"%@\">%@</div>".loc("_Deleted.Placeholder.Title".loc(), deletedGUID, "_Deleted.Placeholder.Restore.Subtitle".loc());
			}
			renderErrorHTML(errorHTML);
			if (canRestore) {
				var restoreLink = $('content-primary').down('.cc-restore-content-link');
				if (restoreLink) {
					Event.observe(restoreLink, 'click', function(inEvent) {
						Element.hide(restoreLink);
						var entityGUID = Event.findElement(inEvent, 'a.cc-restore-content-link').getAttribute('data-guid');
						dialogManager().showProgressMessage("_Deleted.Progress.Restoring".loc());
						// 14054855
						// Restoring may take some time depending on the size of the entity tree, so we periodically
						// check the content is actually isDeleted=false before refreshing the page.  If we refresh
						// the page too soon, we will get the restore UI again.
						var checkEntityPollInterval = 2000; // 2s
						var checkEntityIsDeleted = function() {
							return server_proxy().entityForGUID(entityGUID, function(inEntity) {
								if (!inEntity || inEntity.isDeleted == true) {
									setTimeout(checkEntityIsDeleted, checkEntityPollInterval);
									return;
								}
								dialogManager().hideProgressMessage();
								window.location.reload();
							}, function() {
								dialogManager().hideProgressMessage();
								notifier().printErrorMessage("_Deleted.Error.CouldNotRestore".loc());
								Element.show(restoreLink);
							});
						}
						server_proxy().undeleteEntityWithGUID(entityGUID, function() {
							setTimeout(checkEntityIsDeleted, checkEntityPollInterval);
						}, function() {
							dialogManager().hideProgressMessage();
							notifier().printErrorMessage("_Deleted.Error.CouldNotRestore".loc());
							Element.show(restoreLink);
						});
					});
				}
			}
			return;
		}
		if (exceptionName) {
			if (exceptionName == "CSPermissionDeniedError") {
				if (exceptionReason == "permission-denied") {
					return renderErrorMessage("_Errors.403".loc());
				}
				else if (exceptionReason == "not-found") {
					return renderErrorMessage("_Errors.404".loc());
				}
			}
			return renderErrorMessage("_Errors.500".loc());
		} else {
			var routeURL = CC.getRouteFromURL();
			var routed;
			if (routeURL) {
				routed = globalRouteHandler().routeURL(routeURL, undefined, true);
			} else {
				routed = globalRouteHandler().routeURL('/', undefined, true);
			}
			if (!routed) {
				renderErrorMessage("_Errors.404".loc());
			}
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Shared desktop route helpers.

CC.RouteHelpers = CC.RouteHelpers || new Object();

// Entity type to body class name map.

CC.RouteHelpers.mapEntityTypeToBodyClassName = function(inType) {
	switch (inType) {
		case 'com.apple.entity.Wiki':
			return 'projects';
		case 'com.apple.entity.User':
			return 'people';
		default:
			return '';
	}
};

// Sets the browser title.

CC.RouteHelpers.setBrowserWindowTitle = function(inTitle) {
	var title = (inTitle || "_OSXServer".loc());
	document.title = title;
};

CC.RouteHelpers.setBodyClassName = function(inClassName, inOptShouldSet) {
	if (!inClassName) return;
	var shouldSet = (inOptShouldSet == undefined ? true : inOptShouldSet);
	if (shouldSet) {
		document.body.addClassName(inClassName);
	} else {
		document.body.removeClassName(inClassName);
	}
};

CC.RouteHelpers.setTopLevelClassNames = function(inOptShouldSet) {
	CC.RouteHelpers.setBodyClassName('toplevel', inOptShouldSet);
};

CC.RouteHelpers.setContentPrimaryFullWidth = function(inOptShouldSet, inOptShouldAnimate) {
	var shouldSet = (inOptShouldSet == undefined ? true : inOptShouldSet);
	CC.RouteHelpers.setContentSecondaryVisible(!shouldSet, inOptShouldAnimate);
	var contentPrimary = mainView.$().down('div#content-primary');
	if (shouldSet) {
		contentPrimary.addClassName('full-width');
	} else {
		contentPrimary.removeClassName('full-width');
	}
};

CC.RouteHelpers.setContentSecondaryVisible = function(inOptShouldBeVisible, inOptShouldAnimate) {
	var contentElement = mainView.$().down('div#content');
	if (!inOptShouldAnimate) contentElement.removeClassName('animates');
	if (inOptShouldBeVisible == undefined || inOptShouldBeVisible) {
		contentElement.removeClassName('no-secondary');
	} else {
		contentElement.addClassName('no-secondary');
	}
	setTimeout(function() {
		if (!inOptShouldAnimate) contentElement.addClassName('animates');
	}, 600);
};

// Updates the display state for the shared main view, header and banner.

CC.RouteHelpers.updateSharedDisplayState = function() {
	mainView.updateDisplayState();
	sharedHeaderView.updateDisplayStateForMenuItems();
	sharedBannerView.updateDisplayState();
};

// Updates the banner for the current container.

CC.RouteHelpers.updateBannerForOwnerOrContainer = function(inOptUseContainerInstead) {
	sharedBannerView.setVisible(true);
	sharedBannerView.setIsTopLevel(false);
	var metaSubstring = 'owner';
	if (inOptUseContainerInstead) metaSubstring = 'container';
	var title = (CC.meta('x-apple-%@-longName'.fmt(metaSubstring)) || CC.meta('x-apple-%@-shortName'.fmt(metaSubstring)));
	var type = CC.meta('x-apple-%@-type'.fmt(metaSubstring));
	var tinyID = CC.meta('x-apple-%@-tinyID'.fmt(metaSubstring));
	var url = CC.entityURLForTypeAndTinyID(type, tinyID, title);
	sharedBannerView.setTitle(title, url);
};

// Sets the selected banner link item by identifer (mBannerLinkGUID).

CC.RouteHelpers.setSelectedBannerLinkByGUID = function(inBannerLinkGUID) {
	// Fetch the current banner links.
	var bannerLinks = (sharedBannerView.mBannerLinkItems || []), bannerLink, bannerLinkGUID;
	for (bdx = 0; bdx < bannerLinks.length; bdx++) {
		bannerLink = bannerLinks[bdx];
		bannerLinkGUID = bannerLink.mBannerLinkGUID;
		bannerLink.markAsSelected(inBannerLinkGUID == bannerLinkGUID);
	}
};

// Returns an array of breadcrumb nar items for an owner/container including a leading type breadcrumb, e.g. people.

CC.RouteHelpers.breadcrumbBarItemsForOwnerOrContainer = function(inOptUseContainerInstead) {
	var metaSubstring = 'owner';
	if (inOptUseContainerInstead) metaSubstring = 'container';
	var title = (CC.meta('x-apple-%@-longName'.fmt(metaSubstring)) || CC.meta('x-apple-%@-shortName'.fmt(metaSubstring)));
	var type = CC.meta('x-apple-%@-type'.fmt(metaSubstring));
	var tinyID = CC.meta('x-apple-%@-tinyID'.fmt(metaSubstring));
	var url = CC.entityURLForTypeAndTinyID(type, tinyID, title);
	var crumbs = [];
	if (type == 'com.apple.entity.Wiki') {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_General.Wikis".loc(), 'mURL': '/wiki/projects'}));
	} else if (type == 'com.apple.entity.User') {
		crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_General.People".loc(), 'mURL': '/wiki/people'}));
	}
	crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': title, 'mURL': url}));
	return crumbs;
};

// Updates the header bar breadcrumb trail.

CC.RouteHelpers.updateBreadcrumbBarForEntityAndOwner = function() {
	var entityIsBlogPost = (CC.meta('x-apple-entity-isBlogpost') == "true");
	var newCrumbs = CC.RouteHelpers.breadcrumbBarItemsForOwnerOrContainer(entityIsBlogPost);
	// If the entity is a blog post, we need one more level of indirection and a blog item.
	if (entityIsBlogPost) {
		var containerType = CC.meta('x-apple-container-type');
		var containerTinyID = CC.meta('x-apple-container-tinyID');
		var containerURL = CC.entityURLForTypeAndTinyID(containerType, containerTinyID);
		newCrumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_Blog.Default.Title".loc(), 'mURL': "%@/blog".fmt(containerURL)}));
	}
	// If the entity is not a detail page, push a breadcrumb.
	if (CC.meta('x-apple-entity-isDetailPage') != "true") {
		var entityTitle = (CC.meta('x-apple-entity-longName') || CC.meta('x-apple-entity-shortName'));
		var entityType = CC.meta('x-apple-entity-type');
		var entityTinyID = CC.meta('x-apple-entity-tinyID');
		var entityURL = CC.entityURLForTypeAndTinyID(entityType, entityTinyID, entityTitle);
		newCrumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': entityTitle, 'mURL': entityURL}));
	}
	sharedHeaderView.setBreadcrumbItems(newCrumbs);
};

// Helpers for detecting if features are enabled/disabled.

CC.RouteHelpers.wikiEnabled = function() {
	return (CC.meta("x-apple-service-wiki-enabled") == "true");
};

CC.RouteHelpers.webauthEnabled = function() {
	return (CC.meta("x-apple-service-webauth-enabled") == "true");
};

CC.RouteHelpers.webcalEnabled = function() {
	var nonSSLCalendarWebAppLoaded = (CC.meta("x-apple-service-webcal-enabled") == "true");
	var sslCalendarWebAppLoaded = (CC.meta("x-apple-service-webcalssl-enabled") == "true");
	return (nonSSLCalendarWebAppLoaded || sslCalendarWebAppLoaded);
};

// Webcal may be enabled, but restricted to the SSL site.

CC.RouteHelpers.webcalEnabledForCurrentProtocol = function() {
	var nonSSLCalendarWebAppLoaded = (CC.meta("x-apple-service-webcal-enabled") == "true");
	var sslCalendarWebAppLoaded = (CC.meta("x-apple-service-webcalssl-enabled") == "true");
	var isSecure = (window.location.protocol == "https:");
	// Calendar is enabled if non-SSL calendar is enabled, or non-SSL AND ssl calendar is enabled or only SSL is enabled and the
	// user is accessing the Web UI over the https scheme.
	if (!isSecure) {
		if (nonSSLCalendarWebAppLoaded) return true;
		if (nonSSLCalendarWebAppLoaded && sslCalendarWebAppLoaded) return true;
	} else {
		if (sslCalendarWebAppLoaded) return true;
	}
	return false;
};

CC.RouteHelpers.xcodeEnabled = function() {
	return (CC.meta("x-apple-service-xcode-enabled") == "true");
};

CC.RouteHelpers.changePasswordEnabled = function() {
	return (CC.meta("x-apple-service-changepassword-enabled") == "true");
};

// Helpers for UI that can be disabled in the collabd.plist.

CC.RouteHelpers.allActivityEnabled = function() {
	if (CC.meta("x-apple-config-DisableAllActivityView") == "true")
		return false;
	return true;
};

CC.RouteHelpers.peopleEnabled = function() {
	if (CC.meta("x-apple-config-DisableAllPeopleView") == "true")
		return false;
	return true;
};

CC.RouteHelpers.projectsEnabled = function() {
	if (CC.meta("x-apple-config-DisableAllProjectsView") == "true")
		return false;
	return true;
};

// Updates the browser title for the current entity and owner.

CC.RouteHelpers.setBrowserWindowTitleForEntityAndOwner = function() {
	var titleFormatString = "%@ - %@";
	var ownerTitle = (CC.meta('x-apple-owner-longName') || CC.meta('x-apple-owner-shortName'));
	var entityTitle = (CC.meta('x-apple-entity-longName') || CC.meta('x-apple-entity-shortName'));
	var title = titleFormatString.fmt(ownerTitle, entityTitle);
	CC.RouteHelpers.setBrowserWindowTitle(title);
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.Routes = CC.Routes || new Object();

// Built-in regexp patterns for default application routes.

CC.Routes.TrailingSlashOptionalQueryParam = "/?(\\\?[^\/]+)?";
CC.Routes.SLASH_ROUTE = "/" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_INDEX_ROUTE = "/xcode" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOTS_ROUTE = "/xcode/bots" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_ROUTE = "/xcode/bots/:tinyID" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_TITLE_ROUTE = "/xcode/bots/:tinyID/:title" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_SUMMARY_ROUTE = "/xcode/bots/:tinyID/summary" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_TESTS_ROUTE = "/xcode/bots/:tinyID/tests" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_COMMITS_ROUTE = "/xcode/bots/:tinyID/commits" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_LOGS_ROUTE = "/xcode/bots/:tinyID/logs" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_ARCHIVES_ROUTE = "/xcode/bots/:tinyID/archives" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BIG_SCREEN_ROUTE = "/xcode/bigscreen" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_INTEGRATION_ROUTE =  "/xcode/bots/:tinyID/integration/:integrationNumber";
CC.Routes.XCODE_BOT_TINYID_INTEGRATION_SUMMARY_ROUTE = "/xcode/bots/:tinyID/integration/:integrationNumber/summary" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_INTEGRATION_TESTS_ROUTE = "/xcode/bots/:tinyID/integration/:integrationNumber/tests" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_INTEGRATION_COMMITS_ROUTE = "/xcode/bots/:tinyID/integration/:integrationNumber/commits" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_INTEGRATION_LOGS_ROUTE = "/xcode/bots/:tinyID/integration/:integrationNumber/logs" + CC.Routes.TrailingSlashOptionalQueryParam;
CC.Routes.XCODE_BOT_TINYID_INTEGRATION_ARCHIVES_ROUTE = "/xcode/bots/:tinyID/integration/:integrationNumber/archives" + CC.Routes.TrailingSlashOptionalQueryParam;

// Route notifications.

CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE = 'ROUTES_SHOULD_UPDATE';
CC.Routes.NOTIFICATION_ROUTE_DID_DISPATCH = 'ROUTE_DID_DISPATCH';
CC.Routes.NOTIFICATION_ROUTE_DID_COMPLETE = 'ROUTE_DID_COMPLETE';
CC.Routes.NOTIFICATION_ROUTE_DID_FAIL = 'ROUTE_DID_FAIL';
CC.Routes.NOTIFICATION_UPDATE_ROUTES_TAB_NAME = 'UPDATE_ROUTES_TAB_NAME';
CC.Routes.NOTIFICATION_UPDATE_ROUTES_INTEGRATION_NUMBER = 'UPDATE_ROUTES_INTEGRATION_NUMBER';

// Route constants.

CC.Routes.ROUTE_FAILED = 0;
CC.Routes.ROUTE_FIRED = 1;
CC.Routes.ROUTE_QUEUED = 2;
CC.Routes.ROUTE_IGNORED = 3;

// Base route class. A route is a combination of a route regex pattern and a callback function
// that fires when that route is matched.

CC.Routes.Route = Class.create(CC.Object, {
	mRegexPatternString: null,
	mCallback: null,
	initialize: function(/* [options] */) {
		if (arguments && arguments.length > 0) Object.extend(this, arguments[0]);
	},
	// Callback function that will fire when this route is activated. You will be passed a
	// CC.Routes.RouteInvocation instance.
	mCallback: function(inRouteInvocation) {
		window.location.url = inURL;
	}
});

// Route invocation class. Your route callback will be passed a route invocation when it fires.
// The global routes system only fires one route at a time. When your route fires, you can do
// whatever work you need to in your route callback function, but it is your responsibility to
// call routeDidComplete or routeDidFail to dequeue this route invocation from the global queue.

CC.Routes.RouteInvocation = Class.create(CC.Object, {
	// The URL that activated this route.
	url: null,
	// A hash of named regular expression matches (e.g. {tinyID: 'abc123', title: 'Title.html'}).
	namedMatches: null,
	// An array of all matches. 
	matches: null,
	// Callback function for this route.
	callback: null,
	// Should this route alter the URL hash?
	setURLHash: false,
	// Should we push a URL state for this route?
	pushURLState: false,
	// Window title for this route.
	windowTitle: "",
	// State.
	_completed: false,
	_failed: false,
	routeDidComplete: function() {
		this._completed = true;
		globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTE_DID_COMPLETE, this);
	},
	routeDidFail: function() {
		this._failed = true;
		globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTE_DID_FAIL, this);
	}
});

// A wrapper around an array that behaves as a stack.

CC.Routes.RouteHistoryStack = Class.create({
	initialize: function() {
		this.flush();
	},
	stack: function() {
		return this._stack;
	},
	// Pushes a new route on to the stack returning true where the route was added successfully.
	pushRoute: function(inRoute) {
		if (inRoute) {
			this._stack.push(inRoute);
			return true;
		}
		return false;
	},
	// Pops the least recent route from the stack and returns it.
	popLeastRecentRoute: function() {
		return this._stack.shift();
	},
	// Pops the most recent route from the stack and returns it.
	popMostRecentRoute: function() {
		return this._stack.pop();
	},
	flush: function() {
		this._stack = new Array();
	},
	isFirstLoad: function(){
		var stack = this.stack();
		if (stack.length > 1) {
			return true;
		}
		else {
			return false;
		}
	}
});

// Route handling.

CC.Routes.GlobalRouteHandler = Class.createWithSharedInstance('globalRouteHandler');
CC.Routes.GlobalRouteHandler.prototype = {
	// An array of (compiledRegex, groupingNames, callback) tuples for each registered route.
	mRegisteredRoutes: new Array(),
	// Global route queue.  Routes are dispatched from this queue in order, one at a time.
	mGlobalRouteQueue: new Array(),
	// The currently active route.
	mCurrentRoute: null,
	// Route history stack.  When a route is fired, the invocation is automatically pushed onto the route history stack.
	mRouteStack: new CC.Routes.RouteHistoryStack(),
	// The current prefire callback function.
	mRoutePrefireCallback: null,
	// Does firing a route trigger a page redirect to the route url?
	mRoutesTriggerReload: false,
	// Should we set the URL hash by default?
	mDefaultRoutesSetURLHash: false,
	// Should we push URL state by default?
	mDefaultRoutesPushURLState: false,
	// Should we route ALL links (regardless of their cc-routable status)?
	mRouteAllLinks: true,
	// The CSS selector that determines which elements should be routeable.
	mRouteSelectorPattern: '*.cc-routable:not(.cc-route-enabled)',
	initialize: function() {
		globalNotificationCenter().subscribe(CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE, this.handleRoutesShouldUpdateNotification.bind(this));
		globalNotificationCenter().subscribe(CC.Routes.NOTIFICATION_ROUTE_DID_COMPLETE, this.handleRouteStatusNotification.bind(this));
		globalNotificationCenter().subscribe(CC.Routes.NOTIFICATION_ROUTE_DID_FAIL, this.handleRouteStatusNotification.bind(this));
		window.onpopstate = this.handlePopStateEvent.bind(this);
	},
	// Registers an arbitrary pattern string and callback function.
	register: function(inRegexPatternString, inCallback) {
		var route = new CC.Routes.Route({
			'mRegexPatternString': inRegexPatternString,
			'mCallback': inCallback
		});
		this.registerRoute(route);
	},
	// Registers a new CC.Routes.Route handler.
	registerRoute: function(inRoute) {
		if (!CC.kindOf(inRoute, CC.Routes.Route)) logger().error("Tried to register something other than a CC.Routes.Route as a route handler");
		var patternString = inRoute.mRegexPatternString, callback = inRoute.mCallback;
		// Compile the regex for this route, and keep track of the named groupings.
		var namedParamMatchesRegex = /(:[A-Za-z0-9-_]+)/g;
		var namedParamMatches = patternString.match(namedParamMatchesRegex);
		var replacedPatternString = patternString.replace(namedParamMatchesRegex, "([^\/]+)");
		replacedPatternString = "^" + replacedPatternString.replace(/\//g, "\\/") + "$";
		// Drop the ":" off the front of each grouping name.
		var groupingNames = [];
		if (namedParamMatches) {
			for (var idx = 0; idx < namedParamMatches.length; idx++) {
				var param = namedParamMatches[idx];
				groupingNames.push(param.substring(1, param.length));
			}
		}
		// Push this registered route in reverse-registered order so routes registered later have the opportunity
		// to override default routes.
		this.mRegisteredRoutes.unshift([replacedPatternString, groupingNames, inRoute.mCallback, patternString]);
		logger().debug("Registered new route (%@, %@, %@)", replacedPatternString, groupingNames, inRoute.mCallback);
	},
	// Evaluates a URL against all registered route handlers (in the order in which they were registered). Instantiates
	// a route invocation for the first matching route, and pushes it on to the global route dispatch queue.
	__evaluateURL: function(inURLString) {
		if (!inURLString) return false;
		var routes = this.mRegisteredRoutes, route, regexp, namedGroupings, namedGrouping, callback, originalRoutePattern, matches, namedMatches;
		for (var rdx = 0; rdx < routes.length; rdx++) {
			route = routes[rdx];
			regexp = route[0], namedGroupings = route[1], callback = route[2], originalRoutePattern = route[3], matches, namedMatches = {};
			// Evaluate the URL against the compiled regular expression for this route.
			matches = inURLString.match(regexp);
			if (matches && matches.length) {
				// We got a match, do we have any named groupings?
				if (namedGroupings && namedGroupings.length) {
					for (gdx = 0; gdx < namedGroupings.length; gdx++) {
						namedGrouping = namedGroupings[gdx];
						if (namedGrouping) namedMatches[namedGrouping] = matches[gdx + 1].escapeHTML();
					}
				}
				
				if (namedMatches['containerName'] && namedMatches['containerName'] != 'projects' && namedMatches['containerName'] != 'people' && namedMatches['containerName'] != 'mypage') {
					logger().warn("Failed to find matching route for URL (%@) with container name (%@)".fmt(inURLString, namedMatches['containerName']));
					return false;
				}
				
				// Return a tuple of callback, url, hash of named matches and array of original matches for the regex.
				logger().debug("Found matching route for URL (%@, %@, %@, %@)".fmt(inURLString, namedMatches, matches, callback));
				return [callback, inURLString, namedMatches, matches, originalRoutePattern];
			} else {
				continue;
			}
		}
		logger().warn("Failed to find matching route for URL (%@)".fmt(inURLString));
		return false;
	},
	// Internal method that dispatches the next route in the global route queue. You should not call manually.
	__dispatchRoute: function(inRouteInvocation) {
		if (!inRouteInvocation || !inRouteInvocation.url) return CC.Routes.ROUTE_FAILED;
		var url = inRouteInvocation.url;
		// Do we have a queued identical route? Routes are deemed to be identical if their URLs are identical.
		var queue = this.mGlobalRouteQueue, queueItem;
		if (queue.length) {
			for (var idx = (queue.length - 1); idx >= 0; idx--) {
				queueItem = queue[idx];
				if (queueItem && queueItem.url == url) {
					logger().info("Ignoring route because an identical route is already queued (%@)".fmt(url));
					return CC.Routes.ROUTE_IGNORED;
				}
			}
		}
		// Do we have a route in progress that is identical?
		if (this.mCurrentRoute && (this.mCurrentRoute.url == url)) {
			logger().info("Ignoring route because it has a url that is identical to the last route (%@)".fmt(url));
			return CC.Routes.ROUTE_IGNORED;
		}
		// Push this route invocation onto the queue.
		this.mGlobalRouteQueue.push(inRouteInvocation);
		// Immediately dispatch if we don't have an active route already.
		if (!this.mCurrentRoute) this.__dispatchNextRoute();
	},
	__dispatchNextRoute: function() {
		delete this.mCurrentRoute;
		if (this.mGlobalRouteQueue.length > 0) {
			var queued = false;
			if (this.mGlobalRouteQueue.length != 1) queued = true;
			// Grab the next route invocation in the dispatch queue.
			var nextRoute = this.mGlobalRouteQueue.shift();
			if (nextRoute && nextRoute.callback) {
				this.mCurrentRoute = nextRoute;
				var cb = nextRoute.callback;
				cb(nextRoute);
				globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTE_DID_DISPATCH, nextRoute);
				// Push the route we just fired onto the route stack.
				this.mRouteStack.pushRoute(nextRoute);
				return (queued ? CC.Routes.ROUTE_QUEUED : CC.Routes.ROUTE_FIRED);
			} else {
				this.__dispatchNextRoute();
			}
		}
	},
	// Enables a route for every link tag or element with a cc-routable class name element on the page.
	handleRoutesShouldUpdateNotification: function(inMessage, inObject, inOptExtras) {
		var bound = this.routeEvent.bindAsEventListener(this);
		var routables = [], routable;
		var selector = (this.mRouteAllLinks ? this.mRouteSelectorPattern : this.mRouteSelectorPattern);
		// Did we get passed an explicit root element?
		if (inOptExtras && inOptExtras.rootElement) {
			routables = $(inOptExtras.rootElement).select(selector);
		} else {
			routables = $$(selector);
		}
		for (var idx = 0; idx < routables.length; idx++) {
			routable = routables[idx];
			Event.observe(routable, 'click', bound, false);
			Element.addClassName(routable, 'cc-route-enabled');
		}
	},
	// Route status changed notification handler.
	handleRouteStatusNotification: function(inMessage, inObject, inOptExtras) {
		var didComplete = (inMessage == CC.Routes.NOTIFICATION_ROUTE_DID_COMPLETE);
		didComplete ? logger().debug("Route completed:", inObject) : logger().error("Route failed:", inObject);
		if (inObject == this.mCurrentRoute) {
			// Set the URL hash if we need to.
			var setHash = (inObject.setURLHash || this.mDefaultRoutesSetURLHash);
			if (didComplete && setHash) window.location.hash = "route=%@".fmt(inObject.url);
			// Push the URL state if we need to.
			var shouldPushURLState = (inObject.pushURLState || this.mDefaultRoutesPushURLState);
			if (didComplete && shouldPushURLState) {
				if (history.pushState) {
					history.pushState({}, (inObject.windowTitle || ""), inObject.url);
				}
				else {
					window.location = inObject.url;
				}
			}
			this.__dispatchNextRoute();
		} else {
			logger().debug("Got a route notification for a route other than the active route, ignoring");
		}
	},
	handlePopStateEvent: function(inEvent) {
		if (this.mRouteStack.isFirstLoad()) {
			this.routeURL(window.location.pathname, undefined, true, false, false, document.title);
		}
	},
	// Default callback for all routed elements which evaluates a URL to a routing tuple and fires a registered
	// callback where it exists. Otherwise the event proceeds as normal.
	routeEvent: function(inEvent) {
		var isCommandClick = isCommandClickEvent(inEvent);
		
		var elem = Event.findElement(inEvent, '.cc-route-enabled');
		if (elem) {
			// Grab the URL by looking at a data-route-href attribute first, and an href second.
			var href = elem.getAttribute('data-route-href') || elem.getAttribute('href');
			var redirectOverrideFlag = (elem.getAttribute('data-redirect-override') == "true" ? true : false);
			var pushState = (elem.getAttribute('data-push-state') == "true" ? true : false);
			var urlHash = (elem.getAttribute('data-url-hash') == "true" ? true : false);
			
			var tabName = (elem.getAttribute('data-tab-name'));
			var integrationNumber = (elem.getAttribute('data-integration-number'));
			
			if (!isCommandClick) {
				inEvent.preventDefault();
				
				if (tabName !== null && tabName !== "") {
					globalNotificationCenter().publish(CC.Routes.NOTIFICATION_UPDATE_ROUTES_TAB_NAME, undefined, {'tabName': tabName});
				}
				if (integrationNumber !== null && integrationNumber !== "") {
					globalNotificationCenter().publish(CC.Routes.NOTIFICATION_UPDATE_ROUTES_INTEGRATION_NUMBER, undefined, {'integrationNumber': integrationNumber});
				}
			}
			else {
				return true;
			}
			
			if (href) {
				return this.routeURL(href, inEvent, redirectOverrideFlag, urlHash, pushState);
			}
		}
		return false;
	},
	routeURL: function(inURL, inOptSourceEvent, inOptRedirectOverrideFlag, inOptSetURLHash, inOptPushURLState, inOptWindowTitle) {
		// Do we have a prefire callback?  If we do, check if we should even process this route.
		if (this.mRoutePrefireCallback) {
			var _callback = this.mRoutePrefireCallback;
			var shouldProceed = _callback();
			if (!shouldProceed) return true;
		}
		var routeTuple = this.__evaluateURL(inURL);
		var routeInvocation;
		if (routeTuple && routeTuple.length) {
			// Do routes trigger a page reload?  Only redirect if the override flag has not been passed.
			if (this.mRoutesTriggerReload && !inOptPushURLState && !inOptRedirectOverrideFlag) {
				window.location.href = inURL;
				return true;
			}
			// Stop the event since we're about to handle it.
			if (inOptSourceEvent) Event.stop(inOptSourceEvent);
			var callback = routeTuple[0], url = routeTuple[1], namedMatches = routeTuple[2], matches = routeTuple[3], originalRoutePattern = routeTuple[4];
			// Initialize a route invocation.
			var invocationHash = {
				'callback': (callback || Prototype.emptyFunction),
				'url': (url || ""),
				'namedMatches': (namedMatches || {}),
				'matches': (matches || []),
				'originalRoutePattern': originalRoutePattern
			};
			if (inOptSetURLHash !== undefined) invocationHash['setURLHash'] = (inOptSetURLHash == true);
			if (inOptPushURLState !== undefined) invocationHash['pushURLState'] = (inOptPushURLState == true);
			if (inOptWindowTitle) invocationHash['windowTitle'] = inOptWindowTitle;
			routeInvocation = new CC.Routes.RouteInvocation(invocationHash);
			// Dispatch it.
			this.__dispatchRoute(routeInvocation);
			return true;
		}
		logger().debug("Got an empty route tuple after evaluating URL (%@)", inURL);
		return false;
	},
	// Registers a callback function that fires before any route is fired similar to the window onunload event
	// that fires when the user tries to click away from the active window.  Useful for mimicing the same
	// behavior where routes are in use but the window is not reloading.  If you return true the route will fire,
	// otherwise the route will be cancelled.
	setRoutePrefireCallback: function(inCallback) {
		if (!inCallback) {
			logger().warn("Called setRoutePrefireCallback without passing a valid callback (%@) ... current callback will be cleared", inCallback);
			this.mRoutePrefireCallback = null;
		} else {
			logger().debug("Set a new prefire callback (%@) in globalRouteHandler", inCallback);
			this.mRoutePrefireCallback = inCallback;
		}
	}
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Returns the current set of URL parameters in an Object keyed by parameter name.

CC.params = function(inOptHref) {
	var href = (inOptHref || window.location.href);
	var properties = href.slice(href.indexOf('?') + 1);
	return properties.toQueryParams();
};

// Caches so we don't recalculate URLs over and over.

var __urlTypeFragmentMap = {};
var __entityURLMap = {};
var __entityURLMapMinusTitles = {};

// Maps an entity type (e.g. com.apple.entity.Page) to a lowercase URL component (e.g. pages).

var urlTypeFragmentForEntityType = function(inEntityType) {
	var type = __urlTypeFragmentMap[inEntityType]
	if (!type) {
		var split = (inEntityType || "entities").split('.');
		var lastComponent = split[split.length - 1];
		type = lastComponent = lastComponent.toLowerCase();
		if (type != "entities") {
			var entityType = CC.meta('x-apple-entity-type');
			var isBlogPost = CC.meta('x-apple-entity-isBlogpost') == "true";
			var containerType = CC.meta('x-apple-container-type');
						
			// Pluralize and downcase the last component.
			type += "s";
			if (type == "users") {
				type = "people";
			}
			else if (type == 'wikis') {
				type = 'projects';
			}
			else if (type == 'blogs' && ((entityType == 'com.apple.entity.Page') || (entityType == 'com.apple.entity.File')) && isBlogPost) {
				type = urlTypeFragmentForEntityType(containerType);
			}
		}
		__urlTypeFragmentMap[inEntityType] = type;
	}
	return type;
};

CC.entityURL = function(inEntity, inOptShouldIncludeTitle) {
	var type = inEntity.type;
	var tinyID = inEntity.tinyID;
	var guid = inEntity.guid;
	var login = inEntity.shortName || inEntity.tinyID;
	if (!type || !(tinyID || guid || login)) return undefined;
	var id = (tinyID || guid);
	var subpath = "/wiki";
	type = urlTypeFragmentForEntityType(type);
	if (type == "people") {
		id = login;
	}
	if (type == "bots" || type == "botruns") {
		subpath = "/xcode";
	}
	var url = (inOptShouldIncludeTitle ? __entityURLMap[id] : __entityURLMapMinusTitles[id]);
	if (!url) {
		if (inOptShouldIncludeTitle) {
			var title = (inEntity.longName || inEntity.shortName || "Untitled");
			title = title.gsub(/[\s]+/, '_').gsub(/[^\w]+/, '')
			url = __entityURLMap[id] = "%@/%@/%@/%@.html".fmt(subpath, type, id, title);
		} else {
			url = __entityURLMapMinusTitles[id] = "%@/%@/%@".fmt(subpath, type, id);
		}
	}
	return url.escapeHTML();
};

CC.entityURLForTypeAndTinyID = function(inType, inTinyID, inOptTitle) {
	return CC.entityURL({
		'type': inType,
		'tinyID': inTinyID,
		'longName': inOptTitle
	}, (inOptTitle != undefined));
};

CC.entityURLForTypeAndGUID = function(inType, inGUID, inOptTitle) {
	return CC.entityURL({
		'type': inType,
		'guid': inGUID,
		'longName': inOptTitle
	}, (inOptTitle != undefined));
};

// Sniffs a route from the URL hash, expects http://...#route=/wiki/foo/bar.

CC.getRouteFromURLHash = function() {
	var hash = window.location.hash;
	if (hash) {
		var matches = hash.match(/route=(.*)$/);
		if (matches && matches.length && matches[1].startsWith("/")) {
			return matches[1];
		}
	}
};

// Sniffs a route from the URL itself, expects http://.../wiki/foo/bar.

CC.getRouteFromURL= function() {
	var search = window.location.search;
	var href = window.location.pathname + (search != "?" ? search : "");
	return href;
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.












;

