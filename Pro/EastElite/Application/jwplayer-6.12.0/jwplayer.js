/**
 * JW Player Source start cap
 *
 * This will appear at the top of the JW Player source
 *
 * @version 6.0
 */

if (typeof jwplayer === 'undefined') {
    /**
     * JW Player namespace definition
     * @version 6.0
     */

    /*global jwplayer:true*/
    jwplayer = function () {
        if (jwplayer.api) {
            return jwplayer.api.selectPlayer.apply(this, arguments);
        }
    };

    jwplayer.version = '6.12.0';

    // "Shiv" method for older IE browsers; required for parsing media tags
    jwplayer.vid = document.createElement('video');
    jwplayer.audio = document.createElement('audio');
    jwplayer.source = document.createElement('source');
    //     Underscore.js 1.6.0
    //     http://underscorejs.org
    //     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
    //     Underscore may be freely distributed under the MIT license.

    // https://github.com/jashkenas/underscore/blob/1f4bf626f23a99f7a676f5076dc1b1475554c8f7/underscore.js

    (function () {

        var root = this;

        // Establish the object that gets returned to break out of a loop iteration.
        var breaker = {};

        // Save bytes in the minified (but not gzipped) version:
        var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

        // Create quick reference variables for speed access to core prototypes.
        var
            slice = ArrayProto.slice,
            concat = ArrayProto.concat,
            toString = ObjProto.toString,
            hasOwnProperty = ObjProto.hasOwnProperty;

        // All **ECMAScript 5** native function implementations that we hope to use
        // are declared here.
        var
            nativeMap = ArrayProto.map,
            nativeForEach = ArrayProto.forEach,
            nativeFilter = ArrayProto.filter,
            nativeEvery = ArrayProto.every,
            nativeSome = ArrayProto.some,
            nativeIndexOf = ArrayProto.indexOf,
            nativeIsArray = Array.isArray,
            nativeKeys = Object.keys;

        // Create a safe reference to the Underscore object for use below.
        var _ = function (obj) {
            if (obj instanceof _) return obj;
            if (!(this instanceof _)) return new _(obj);
        };

        // Collection Functions
        // --------------------

        // The cornerstone, an `each` implementation, aka `forEach`.
        // Handles objects with the built-in `forEach`, arrays, and raw objects.
        // Delegates to **ECMAScript 5**'s native `forEach` if available.
        var each = _.each = _.forEach = function (obj, iterator, context) {
            if (obj == null) return obj;
            if (nativeForEach && obj.forEach === nativeForEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, length = obj.length; i < length; i++) {
                    if (iterator.call(context, obj[i], i, obj) === breaker) return;
                }
            } else {
                var keys = _.keys(obj);
                for (var i = 0, length = keys.length; i < length; i++) {
                    if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
                }
            }
            return obj;
        };

        // Return the results of applying the iterator to each element.
        // Delegates to **ECMAScript 5**'s native `map` if available.
        _.map = _.collect = function (obj, iterator, context) {
            var results = [];
            if (obj == null) return results;
            if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
            each(obj, function (value, index, list) {
                results.push(iterator.call(context, value, index, list));
            });
            return results;
        };

        // Return the first value which passes a truth test. Aliased as `detect`.
        _.find = _.detect = function (obj, predicate, context) {
            var result;
            any(obj, function (value, index, list) {
                if (predicate.call(context, value, index, list)) {
                    result = value;
                    return true;
                }
            });
            return result;
        };


        // Return all the elements that pass a truth test.
        // Delegates to **ECMAScript 5**'s native `filter` if available.
        // Aliased as `select`.
        _.filter = _.select = function (obj, predicate, context) {
            var results = [];
            if (obj == null) return results;
            if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
            each(obj, function (value, index, list) {
                if (predicate.call(context, value, index, list)) results.push(value);
            });
            return results;
        };


        // Determine whether all of the elements match a truth test.
        // Delegates to **ECMAScript 5**'s native `every` if available.
        // Aliased as `all`.
        _.every = _.all = function (obj, predicate, context) {
            predicate || (predicate = _.identity);
            var result = true;
            if (obj == null) return result;
            if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
            each(obj, function (value, index, list) {
                if (!(result = result && predicate.call(context, value, index, list))) return breaker;
            });
            return !!result;
        };

        // Determine if at least one element in the object matches a truth test.
        // Delegates to **ECMAScript 5**'s native `some` if available.
        // Aliased as `any`.
        var any = _.some = _.any = function (obj, predicate, context) {
            predicate || (predicate = _.identity);
            var result = false;
            if (obj == null) return result;
            if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
            each(obj, function (value, index, list) {
                if (result || (result = predicate.call(context, value, index, list))) return breaker;
            });
            return !!result;
        };

        //returns the size of an object
        _.size = function (obj) {
            if (obj == null) return 0;
            return obj.length === +obj.length ? obj.length : _.keys(obj).length;
        };


        // Returns a function that will only be executed after being called N times.
        _.after = function (times, func) {
            return function () {
                if (--times < 1) {
                    return func.apply(this, arguments);
                }
            };
        };

        // An internal function to generate lookup iterators.
        var lookupIterator = function (value) {
            if (value == null) return _.identity;
            if (_.isFunction(value)) return value;
            return _.property(value);
        };

        // Use a comparator function to figure out the smallest index at which
        // an object should be inserted so as to maintain order. Uses binary search.
        _.sortedIndex = function (array, obj, iterator, context) {
            iterator = lookupIterator(iterator);
            var value = iterator.call(context, obj);
            var low = 0, high = array.length;
            while (low < high) {
                var mid = (low + high) >>> 1;
                iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
            }
            return low;
        };

        // Return the first value which passes a truth test. Aliased as `detect`.
        _.find = _.detect = function (obj, predicate, context) {
            var result;
            any(obj, function (value, index, list) {
                if (predicate.call(context, value, index, list)) {
                    result = value;
                    return true;
                }
            });
            return result;
        };

        // Determine if at least one element in the object matches a truth test.
        // Delegates to **ECMAScript 5**'s native `some` if available.
        // Aliased as `any`.
        var any = _.some = _.any = function (obj, predicate, context) {
            predicate || (predicate = _.identity);
            var result = false;
            if (obj == null) return result;
            if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
            each(obj, function (value, index, list) {
                if (result || (result = predicate.call(context, value, index, list))) return breaker;
            });
            return !!result;
        };

        _.contains = _.include = function (obj, target) {
            if (obj == null) return false;
            if (obj.length !== +obj.length) obj = _.values(obj);
            return _.indexOf(obj, target) >= 0;
        };

        // Convenience version of a common use case of `filter`: selecting only objects
        // containing specific `key:value` pairs.
        _.where = function (obj, attrs) {
            return _.filter(obj, _.matches(attrs));
        };

        // Take the difference between one array and a number of other arrays.
        // Only the elements present in just the first array will remain.
        _.difference = function (array) {
            var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
            return _.filter(array, function (value) { return !_.contains(rest, value); });
        };

        // Return a version of the array that does not contain the specified value(s).
        _.without = function (array) {
            return _.difference(array, slice.call(arguments, 1));
        };

        // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
        // we need this function. Return the position of the first occurrence of an
        // item in an array, or -1 if the item is not included in the array.
        // Delegates to **ECMAScript 5**'s native `indexOf` if available.
        // If the array is large and already in sort order, pass `true`
        // for **isSorted** to use binary search.
        _.indexOf = function (array, item, isSorted) {
            if (array == null) return -1;
            var i = 0, length = array.length;
            if (isSorted) {
                if (typeof isSorted == 'number') {
                    i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
                } else {
                    i = _.sortedIndex(array, item);
                    return array[i] === item ? i : -1;
                }
            }
            if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
            for (; i < length; i++) if (array[i] === item) return i;
            return -1;
        };



        // Function (ahem) Functions
        // ------------------


        // Partially apply a function by creating a version that has had some of its
        // arguments pre-filled, without changing its dynamic `this` context. _ acts
        // as a placeholder, allowing any combination of arguments to be pre-filled.
        _.partial = function (func) {
            var boundArgs = slice.call(arguments, 1);
            return function () {
                var position = 0;
                var args = boundArgs.slice();
                for (var i = 0, length = args.length; i < length; i++) {
                    if (args[i] === _) args[i] = arguments[position++];
                }
                while (position < arguments.length) args.push(arguments[position++]);
                return func.apply(this, args);
            };
        };

        // Memoize an expensive function by storing its results.
        _.memoize = function (func, hasher) {
            var memo = {};
            hasher || (hasher = _.identity);
            return function () {
                var key = hasher.apply(this, arguments);
                return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
            };
        };

        // Delays a function for the given number of milliseconds, and then calls
        // it with the arguments supplied.
        _.delay = function (func, wait) {
            var args = slice.call(arguments, 2);
            return setTimeout(function () { return func.apply(null, args); }, wait);
        };

        // Defers a function, scheduling it to run after the current call stack has
        // cleared.
        _.defer = function (func) {
            return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
        };

        // Retrieve the names of an object's properties.
        // Delegates to **ECMAScript 5**'s native `Object.keys`
        _.keys = function (obj) {
            if (!_.isObject(obj)) return [];
            if (nativeKeys) return nativeKeys(obj);
            var keys = [];
            for (var key in obj) if (_.has(obj, key)) keys.push(key);
            return keys;
        };


        // Return a copy of the object only containing the whitelisted properties.
        _.pick = function (obj) {
            var copy = {};
            var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
            each(keys, function (key) {
                if (key in obj) copy[key] = obj[key];
            });
            return copy;
        };


        // Is a given value an array?
        // Delegates to ECMA5's native Array.isArray
        _.isArray = nativeIsArray || function (obj) {
            return toString.call(obj) == '[object Array]';
        };

        // Is a given variable an object?
        _.isObject = function (obj) {
            return obj === Object(obj);
        };

        // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
        each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function (name) {
            _['is' + name] = function (obj) {
                return toString.call(obj) == '[object ' + name + ']';
            };
        });

        // Define a fallback version of the method in browsers (ahem, IE), where
        // there isn't any inspectable "Arguments" type.
        if (!_.isArguments(arguments)) {
            _.isArguments = function (obj) {
                return !!(obj && _.has(obj, 'callee'));
            };
        }

        // Optimize `isFunction` if appropriate.
        if (typeof (/./) !== 'function') {
            _.isFunction = function (obj) {
                return typeof obj === 'function';
            };
        }

        // Is a given object a finite number?
        _.isFinite = function (obj) {
            return isFinite(obj) && !isNaN(parseFloat(obj));
        };

        // Is the given value `NaN`? (NaN is the only number which does not equal itself).
        _.isNaN = function (obj) {
            return _.isNumber(obj) && obj != +obj;
        };

        // Is a given value a boolean?
        _.isBoolean = function (obj) {
            return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
        };

        // Is a given value equal to null?
        _.isNull = function (obj) {
            return obj === null;
        };

        // Is a given variable undefined?
        _.isUndefined = function (obj) {
            return obj === void 0;
        };

        // Shortcut function for checking if an object has a given property directly
        // on itself (in other words, not on a prototype).
        _.has = function (obj, key) {
            return hasOwnProperty.call(obj, key);
        };

        // Keep the identity function around for default iterators.
        _.identity = function (value) {
            return value;
        };

        _.constant = function (value) {
            return function () {
                return value;
            };
        };

        _.property = function (key) {
            return function (obj) {
                return obj[key];
            };
        };

        // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
        _.matches = function (attrs) {
            return function (obj) {
                if (obj === attrs) return true; //avoid comparing an object to itself.
                for (var key in attrs) {
                    if (attrs[key] !== obj[key])
                        return false;
                }
                return true;
            }
        };

        // If the value of the named `property` is a function then invoke it with the
        // `object` as context; otherwise, return it.
        _.result = function (object, property) {
            if (object == null) return void 0;
            var value = object[property];
            return _.isFunction(value) ? value.call(object) : value;
        };


        root._ = _;
    }).call(jwplayer);
    (function (jwplayer) {
        /*jshint maxparams:5*/

        var utils = jwplayer.utils = {};
        var _ = jwplayer._;

        /**
         * Returns true if the value of the object is null, undefined or the empty
         * string
         *
         * @param a The variable to inspect
         */
        utils.exists = function (item) {
            switch (typeof (item)) {
                case 'string':
                    return (item.length > 0);
                case 'object':
                    return (item !== null);
                case 'undefined':
                    return false;
            }
            return true;
        };

        /** Used for styling dimensions in CSS --
         * return the string unchanged if it's a percentage width; add 'px' otherwise **/
        utils.styleDimension = function (dimension) {
            return dimension + (dimension.toString().indexOf('%') > 0 ? '' : 'px');
        };

        /** Gets an absolute file path based on a relative filepath * */
        utils.getAbsolutePath = function (path, base) {
            if (!utils.exists(base)) {
                base = document.location.href;
            }
            if (!utils.exists(path)) {
                return;
            }
            if (isAbsolutePath(path)) {
                return path;
            }
            var protocol = base.substring(0, base.indexOf('://') + 3);
            var domain = base.substring(protocol.length, base.indexOf('/', protocol.length + 1));
            var patharray;
            if (path.indexOf('/') === 0) {
                patharray = path.split('/');
            } else {
                var basepath = base.split('?')[0];
                basepath = basepath.substring(protocol.length + domain.length + 1, basepath.lastIndexOf('/'));
                patharray = basepath.split('/').concat(path.split('/'));
            }
            var result = [];
            for (var i = 0; i < patharray.length; i++) {
                if (!patharray[i] || !utils.exists(patharray[i]) || patharray[i] === '.') {
                    continue;
                } else if (patharray[i] === '..') {
                    result.pop();
                } else {
                    result.push(patharray[i]);
                }
            }
            return protocol + domain + '/' + result.join('/');
        };

        function isAbsolutePath(path) {
            if (!utils.exists(path)) {
                return;
            }
            var protocol = path.indexOf('://');
            var queryparams = path.indexOf('?');
            return (protocol > 0 && (queryparams < 0 || (queryparams > protocol)));
        }

        /** Merges a list of objects **/
        utils.extend = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            if (args.length > 1) {
                var objectToExtend = args[0],
                    extendEach = function (element, arg) {
                        if (arg !== undefined && arg !== null) {
                            objectToExtend[element] = arg;
                        }
                    };
                for (var i = 1; i < args.length; i++) {
                    utils.foreach(args[i], extendEach);
                }
                return objectToExtend;
            }
            return null;
        };

        /** Logger */
        var console = window.console = window.console || {
            log: function () { }
        };
        utils.log = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            if (typeof console.log === 'object') {
                console.log(args);
            } else {
                console.log.apply(console, args);
            }
        };

        var _userAgentMatch = _.memoize(function (regex) {
            var agent = navigator.userAgent.toLowerCase();
            return (agent.match(regex) !== null);
        });

        function _browserCheck(regex) {
            return function () {
                return _userAgentMatch(regex);
            };
        }

        utils.isFF = _browserCheck(/firefox/i);
        utils.isChrome = _browserCheck(/chrome/i);
        utils.isIPod = _browserCheck(/iP(hone|od)/i);
        utils.isIPad = _browserCheck(/iPad/i);
        utils.isSafari602 = _browserCheck(/Macintosh.*Mac OS X 10_8.*6\.0\.\d* Safari/i);

        utils.isIETrident = function (version) {
            if (version) {
                version = parseFloat(version).toFixed(1);
                return _userAgentMatch(new RegExp('trident/.+rv:\\s*' + version, 'i'));
            }
            return _userAgentMatch(/trident/i);
        };


        utils.isMSIE = function (version) {
            if (version) {
                version = parseFloat(version).toFixed(1);
                return _userAgentMatch(new RegExp('msie\\s*' + version, 'i'));
            }
            return _userAgentMatch(/msie/i);
        };
        utils.isIE = function (version) {
            if (version) {
                version = parseFloat(version).toFixed(1);
                if (version >= 11) {
                    return utils.isIETrident(version);
                } else {
                    return utils.isMSIE(version);
                }
            }
            return utils.isMSIE() || utils.isIETrident();
        };

        utils.isSafari = function () {
            return (_userAgentMatch(/safari/i) && !_userAgentMatch(/chrome/i) &&
                !_userAgentMatch(/chromium/i) && !_userAgentMatch(/android/i));
        };

        /** Matches iOS devices **/
        utils.isIOS = function (version) {
            if (version) {
                return _userAgentMatch(new RegExp('iP(hone|ad|od).+\\sOS\\s' + version, 'i'));
            }
            return _userAgentMatch(/iP(hone|ad|od)/i);
        };

        /** Matches Android devices **/
        utils.isAndroidNative = function (version) {
            return utils.isAndroid(version, true);
        };

        utils.isAndroid = function (version, excludeChrome) {
            //Android Browser appears to include a user-agent string for Chrome/18
            if (excludeChrome && _userAgentMatch(/chrome\/[123456789]/i) && !_userAgentMatch(/chrome\/18/)) {
                return false;
            }
            if (version) {
                // make sure whole number version check ends with point '.'
                if (utils.isInt(version) && !/\./.test(version)) {
                    version = '' + version + '.';
                }
                return _userAgentMatch(new RegExp('Android\\s*' + version, 'i'));
            }
            return _userAgentMatch(/Android/i);
        };

        /** Matches iOS and Android devices **/
        utils.isMobile = function () {
            return utils.isIOS() || utils.isAndroid();
        };

        utils.isIframe = function () {
            return (window.frameElement && (window.frameElement.nodeName === 'IFRAME'));
        };

        /** Save a setting **/
        utils.saveCookie = function (name, value) {
            document.cookie = 'jwplayer.' + name + '=' + value + '; path=/';
        };

        /** Retrieve saved  player settings **/
        utils.getCookies = function () {
            var jwCookies = {};
            var cookies = document.cookie.split('; ');
            for (var i = 0; i < cookies.length; i++) {
                var split = cookies[i].split('=');
                if (split[0].indexOf('jwplayer.') === 0) {
                    jwCookies[split[0].substring(9, split[0].length)] = split[1];
                }
            }
            return jwCookies;
        };

        utils.isInt = function (value) {
            return parseFloat(value) % 1 === 0;
        };

        /** Returns the true type of an object * */
        utils.typeOf = function (value) {
            if (value === null) {
                return 'null';
            }
            var typeofString = typeof value;
            if (typeofString === 'object') {
                if (_.isArray(value)) {
                    return 'array';
                }
            }
            return typeofString;
        };

        /* Normalizes differences between Flash and HTML5 internal players' event responses. */
        utils.translateEventResponse = function (type, eventProperties) {
            var translated = utils.extend({}, eventProperties);
            if (type === jwplayer.events.JWPLAYER_FULLSCREEN && !translated.fullscreen) {
                translated.fullscreen = (translated.message === 'true');
                delete translated.message;
            } else if (typeof translated.data === 'object') {
                // Takes ViewEvent 'data' block and moves it up a level
                var data = translated.data;
                delete translated.data;
                translated = utils.extend(translated, data);

            } else if (typeof translated.metadata === 'object') {
                utils.deepReplaceKeyName(translated.metadata,
                    ['__dot__', '__spc__', '__dsh__', '__default__'], ['.', ' ', '-', 'default']);
            }

            var rounders = ['position', 'duration', 'offset'];
            utils.foreach(rounders, function (rounder, val) {
                if (translated[val]) {
                    translated[val] = Math.round(translated[val] * 1000) / 1000;
                }
            });

            return translated;
        };

        /**
         * If the browser has flash capabilities, return the flash version
         */
        utils.flashVersion = function () {
            if (utils.isAndroid()) {
                return 0;
            }

            var plugins = navigator.plugins,
                flash;

            try {
                if (plugins !== 'undefined') {
                    flash = plugins['Shockwave Flash'];
                    if (flash) {
                        return parseInt(flash.description.replace(/\D+(\d+)\..*/, '$1'), 10);
                    }
                }
            } catch (e) {
                // The above evaluation (plugins != undefined) messes up IE7
            }

            if (typeof window.ActiveXObject !== 'undefined') {
                try {
                    flash = new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                    if (flash) {
                        return parseInt(flash.GetVariable('$version').split(' ')[1].split(',')[0], 10);
                    }
                } catch (err) { }
            }
            return 0;
        };


        /** Finds the location of jwplayer.js and returns the path **/
        utils.getScriptPath = function (scriptName) {
            var scripts = document.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                var src = scripts[i].src;
                if (src && src.indexOf(scriptName) >= 0) {
                    return src.substr(0, src.indexOf(scriptName));
                }
            }
            return '';
        };

        /**
         * Recursively traverses nested object, replacing key names containing a
         * search string with a replacement string.
         *
         * @param searchString
         *            The string to search for in the object's key names
         * @param replaceString
         *            The string to replace in the object's key names
         * @returns The modified object.
         */
        utils.deepReplaceKeyName = function (obj, searchString, replaceString) {
            switch (jwplayer.utils.typeOf(obj)) {
                case 'array':
                    for (var i = 0; i < obj.length; i++) {
                        obj[i] = jwplayer.utils.deepReplaceKeyName(obj[i],
                            searchString, replaceString);
                    }
                    break;
                case 'object':
                    utils.foreach(obj, function (key, val) {
                        var searches;
                        if (searchString instanceof Array && replaceString instanceof Array) {
                            if (searchString.length !== replaceString.length) {
                                return;
                            } else {
                                searches = searchString;
                            }
                        } else {
                            searches = [searchString];
                        }
                        var newkey = key;
                        for (var i = 0; i < searches.length; i++) {
                            newkey = newkey.replace(new RegExp(searchString[i], 'g'), replaceString[i]);
                        }
                        obj[newkey] = jwplayer.utils.deepReplaceKeyName(val, searchString, replaceString);
                        if (key !== newkey) {
                            delete obj[key];
                        }
                    });
                    break;
            }
            return obj;
        };


        /**
         * Types of plugin paths
         */
        var _pluginPathType = utils.pluginPathType = {
            ABSOLUTE: 0,
            RELATIVE: 1,
            CDN: 2
        };

        utils.getPluginPathType = function (path) {
            if (typeof path !== 'string') {
                return;
            }
            path = path.split('?')[0];
            var protocol = path.indexOf('://');
            if (protocol > 0) {
                return _pluginPathType.ABSOLUTE;
            }
            var folder = path.indexOf('/');
            var extension = utils.extension(path);
            if (protocol < 0 && folder < 0 && (!extension || !isNaN(extension))) {
                return _pluginPathType.CDN;
            }
            return _pluginPathType.RELATIVE;
        };


        /**
         * Extracts a plugin name from a string
         */
        utils.getPluginName = function (pluginName) {
            /** Regex locates the characters after the last slash, until it encounters a dash. **/
            return pluginName.replace(/^(.*\/)?([^-]*)-?.*\.(swf|js)$/, '$2');
        };

        /**
         * Extracts a plugin version from a string
         */
        utils.getPluginVersion = function (pluginName) {
            return pluginName.replace(/[^-]*-?([^\.]*).*$/, '$1');
        };

        /**
         * Determines if a URL is a YouTube link
         */
        utils.isYouTube = function (path, type) {
            return (type === 'youtube') || (/^(http|\/\/).*(youtube\.com|youtu\.be)\/.+/).test(path);
        };

        /** 
         * Returns a YouTube ID from a number of YouTube URL formats:
         *
         * Matches the following YouTube URL types:
         *  - http://www.youtube.com/watch?v=YE7VzlLtp-4
         *  - http://www.youtube.com/watch?v=YE7VzlLtp-4&extra_param=123
         *  - http://www.youtube.com/watch#!v=YE7VzlLtp-4
         *  - http://www.youtube.com/watch#!v=YE7VzlLtp-4?extra_param=123&another_param=456
         *  - http://www.youtube.com/v/YE7VzlLtp-4
         *  - http://www.youtube.com/v/YE7VzlLtp-4?extra_param=123&another_param=456
         *  - http://youtu.be/YE7VzlLtp-4
         *  - http://youtu.be/YE7VzlLtp-4?extra_param=123&another_param=456
         *  - YE7VzlLtp-4
         **/
        utils.youTubeID = function (path) {
            try {
                // Left as a dense regular expression for brevity.  
                return (/v[=\/]([^?&]*)|youtu\.be\/([^?]*)|^([\w-]*)$/i).exec(path).slice(1).join('').replace('?', '');
            } catch (e) {
                return '';
            }
        };

        /**
         * Determines if a URL is an RTMP link
         */
        utils.isRtmp = function (file, type) {
            return (file.indexOf('rtmp') === 0 || type === 'rtmp');
        };

        /**
         * Iterates over an object and executes a callback function for each property (if it exists)
         * This is a safe way to iterate over objects if another script has modified the object prototype
         */
        utils.foreach = function (aData, fnEach) {
            var key, val;
            for (key in aData) {
                if (utils.typeOf(aData.hasOwnProperty) === 'function') {
                    if (aData.hasOwnProperty(key)) {
                        val = aData[key];
                        fnEach(key, val);
                    }
                } else {
                    // IE8 has a problem looping through XML nodes
                    val = aData[key];
                    fnEach(key, val);
                }
            }
        };

        /** Determines if the current page is HTTPS **/
        utils.isHTTPS = function () {
            return (window.location.href.indexOf('https') === 0);
        };

        /** Gets the repository location **/
        utils.repo = function () {
            var repo = 'http://p.jwpcdn.com/' + jwplayer.version.split(/\W/).splice(0, 2).join('/') + '/';

            try {
                if (utils.isHTTPS()) {
                    repo = repo.replace('http://', 'https://ssl.');
                }
            } catch (e) { }

            return repo;
        };

        utils.versionCheck = function (target) {
            var tParts = ('0' + target).split(/\W/);
            var jParts = jwplayer.version.split(/\W/);
            var tMajor = parseFloat(tParts[0]);
            var jMajor = parseFloat(jParts[0]);
            if (tMajor > jMajor) {
                return false;
            } else if (tMajor === jMajor) {
                if (parseFloat('0' + tParts[1]) > parseFloat(jParts[1])) {
                    return false;
                }
            }
            return true;
        };

        /** Loads an XML file into a DOM object * */
        utils.ajax = function (xmldocpath, completecallback, errorcallback, donotparse) {
            var xmlhttp;
            var isError = false;
            // Hash tags should be removed from the URL since they can't be loaded in IE
            if (xmldocpath.indexOf('#') > 0) {
                xmldocpath = xmldocpath.replace(/#.*$/, '');
            }

            if (_isCrossdomain(xmldocpath) && utils.exists(window.XDomainRequest)) {
                // IE8 / 9
                xmlhttp = new window.XDomainRequest();
                xmlhttp.onload = _ajaxComplete(xmlhttp, xmldocpath, completecallback, errorcallback, donotparse);
                xmlhttp.ontimeout = xmlhttp.onprogress = function () { };
                xmlhttp.timeout = 5000;
            } else if (utils.exists(window.XMLHttpRequest)) {
                // Firefox, Chrome, Opera, Safari
                xmlhttp = new window.XMLHttpRequest();
                xmlhttp.onreadystatechange =
                    _readyStateChangeHandler(xmlhttp, xmldocpath, completecallback, errorcallback, donotparse);
            } else {
                if (errorcallback) {
                    errorcallback('', xmldocpath, xmlhttp);
                }
                return xmlhttp;
            }
            if (xmlhttp.overrideMimeType) {
                xmlhttp.overrideMimeType('text/xml');
            }

            xmlhttp.onerror = _ajaxError(errorcallback, xmldocpath, xmlhttp);
            try {
                xmlhttp.open('GET', xmldocpath, true);
            } catch (error) {
                isError = true;
            }
            // make XDomainRequest asynchronous:
            setTimeout(function () {
                if (isError) {
                    if (errorcallback) {
                        errorcallback(xmldocpath, xmldocpath, xmlhttp);
                    }
                    return;
                }
                try {

                    xmlhttp.send();
                } catch (error) {
                    if (errorcallback) {
                        errorcallback(xmldocpath, xmldocpath, xmlhttp);
                    }
                }
            }, 0);

            return xmlhttp;
        };

        function _isCrossdomain(path) {
            return (path && path.indexOf('://') >= 0) &&
                (path.split('/')[2] !== window.location.href.split('/')[2]);
        }

        function _ajaxError(errorcallback, xmldocpath, xmlhttp) {
            return function () {
                errorcallback('Error loading file', xmldocpath, xmlhttp);
            };
        }

        function _readyStateChangeHandler(xmlhttp, xmldocpath, completecallback, errorcallback, donotparse) {
            return function () {
                if (xmlhttp.readyState === 4) {
                    switch (xmlhttp.status) {
                        case 200:
                            _ajaxComplete(xmlhttp, xmldocpath, completecallback, errorcallback, donotparse)();
                            break;
                        case 404:
                            errorcallback('文件未找到', xmldocpath, xmlhttp);
                    }

                }
            };
        }

        function _ajaxComplete(xmlhttp, xmldocpath, completecallback, errorcallback, donotparse) {
            return function () {
                // Handle the case where an XML document was returned with an incorrect MIME type.
                var xml, firstChild;
                if (donotparse) {
                    completecallback(xmlhttp);
                } else {
                    try {
                        // This will throw an error on Windows Mobile 7.5.
                        // We want to trigger the error so that we can move down to the next section
                        xml = xmlhttp.responseXML;
                        if (xml) {
                            firstChild = xml.firstChild;
                            if (xml.lastChild && xml.lastChild.nodeName === 'parsererror') {
                                if (errorcallback) {
                                    errorcallback('Invalid XML', xmldocpath, xmlhttp);
                                }
                                return;
                            }
                        }
                    } catch (e) { }
                    if (xml && firstChild) {
                        return completecallback(xmlhttp);
                    }
                    var parsedXML = utils.parseXML(xmlhttp.responseText);
                    if (parsedXML && parsedXML.firstChild) {
                        xmlhttp = utils.extend({}, xmlhttp, {
                            responseXML: parsedXML
                        });
                    } else {
                        if (errorcallback) {
                            errorcallback(xmlhttp.responseText ? 'Invalid XML' : xmldocpath, xmldocpath, xmlhttp);
                        }
                        return;
                    }
                    completecallback(xmlhttp);
                }
            };
        }

        /** Takes an XML string and returns an XML object **/
        utils.parseXML = function (input) {
            var parsedXML;
            try {
                // Parse XML in FF/Chrome/Safari/Opera
                if (window.DOMParser) {
                    parsedXML = (new window.DOMParser()).parseFromString(input, 'text/xml');
                    if (parsedXML.childNodes && parsedXML.childNodes.length &&
                        parsedXML.childNodes[0].firstChild.nodeName === 'parsererror') {
                        return;
                    }
                } else {
                    // Internet Explorer
                    parsedXML = new window.ActiveXObject('Microsoft.XMLDOM');
                    parsedXML.async = 'false';
                    parsedXML.loadXML(input);
                }
            } catch (e) {
                return;
            }
            return parsedXML;
        };


        /**
         * Ensure a number is between two bounds
         */
        utils.between = function (num, min, max) {
            return Math.max(Math.min(num, max), min);
        };

        /**
         * Convert a time-representing string to a number.
         *
         * @param {String}	The input string. Supported are 00:03:00.1 / 03:00.1 / 180.1s / 3.2m / 3.2h
         * @return {Number}	The number of seconds.
         */
        utils.seconds = function (str) {
            if (_.isNumber(str)) {
                return str;
            }

            str = str.replace(',', '.');
            var arr = str.split(':');
            var sec = 0;
            if (str.slice(-1) === 's') {
                sec = parseFloat(str);
            } else if (str.slice(-1) === 'm') {
                sec = parseFloat(str) * 60;
            } else if (str.slice(-1) === 'h') {
                sec = parseFloat(str) * 3600;
            } else if (arr.length > 1) {
                sec = parseFloat(arr[arr.length - 1]);
                sec += parseFloat(arr[arr.length - 2]) * 60;
                if (arr.length === 3) {
                    sec += parseFloat(arr[arr.length - 3]) * 3600;
                }
            } else {
                sec = parseFloat(str);
            }
            return sec;
        };

        /**
         * Basic serialization: string representations of booleans and numbers are
         * returned typed
         *
         * @param {String}
         *            val String value to serialize.
         * @return {Object} The original value in the correct primitive type.
         */
        utils.serialize = function (val) {
            if (val === null) {
                return null;
            } else if (val.toString().toLowerCase() === 'true') {
                return true;
            } else if (val.toString().toLowerCase() === 'false') {
                return false;
            } else if (isNaN(Number(val)) || val.length > 5 || val.length === 0) {
                return val;
            } else {
                return Number(val);
            }
        };

        utils.addClass = function (element, classes) {
            // TODO:: use _.union on the two arrays

            var originalClasses = _.isString(element.className) ? element.className.split(' ') : [];
            var addClasses = _.isArray(classes) ? classes : classes.split(' ');

            _.each(addClasses, function (c) {
                if (!_.contains(originalClasses, c)) {
                    originalClasses.push(c);
                }
            });

            element.className = utils.trim(originalClasses.join(' '));
        };

        utils.removeClass = function (element, c) {
            var originalClasses = _.isString(element.className) ? element.className.split(' ') : [];
            var removeClasses = _.isArray(c) ? c : c.split(' ');

            element.className = utils.trim(_.difference(originalClasses, removeClasses).join(' '));
        };

        utils.emptyElement = function (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        };

        utils.indexOf = _.indexOf;
        utils.noop = function () { };

        utils.canCast = function () {
            var cast = jwplayer.cast;
            return !!(cast && _.isFunction(cast.available) && cast.available());
        };

    })(jwplayer);
    (function (jwplayer) {
        var utils = jwplayer.utils,
            MAX_CSS_RULES = 50000,
            _styleSheets = {},
            _styleSheet,
            _rules = {},
            _cssBlock = null,
            _ruleIndexes = {},
            _debug = false;

        function _createStylesheet(debugText) {
            var styleSheet = document.createElement('style');
            if (debugText) {
                styleSheet.appendChild(document.createTextNode(debugText));
            }
            styleSheet.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(styleSheet);
            return styleSheet;
        }

        utils.cssKeyframes = function (keyframeName, keyframeSteps) {
            var styleElement = _styleSheets.keyframes;
            if (!styleElement) {
                styleElement = _createStylesheet();
                _styleSheets.keyframes = styleElement;
            }
            var sheet = styleElement.sheet;
            var rulesText = '@keyframes ' + keyframeName + ' { ' + keyframeSteps + ' }';
            _insertRule(sheet, rulesText, sheet.cssRules.length);
            _insertRule(sheet, rulesText.replace(/(keyframes|transform)/g, '-webkit-$1'), sheet.cssRules.length);
        };

        var _css = utils.css = function (selector, styles, important) {
            important = important || false;

            if (!_rules[selector]) {
                _rules[selector] = {};
            }

            if (!_updateStyles(_rules[selector], styles, important)) {
                //no change in css
                return;
            }
            if (_debug) {
                // add a new style sheet with css text and exit
                if (_styleSheets[selector]) {
                    _styleSheets[selector].parentNode.removeChild(_styleSheets[selector]);
                }
                _styleSheets[selector] = _createStylesheet(_getRuleText(selector));
                return;
            }
            if (!_styleSheets[selector]) {
                // set stylesheet for selector
                var numberRules = _styleSheet && _styleSheet.sheet && _styleSheet.sheet.cssRules &&
                    _styleSheet.sheet.cssRules.length || 0;
                if (!_styleSheet || numberRules > MAX_CSS_RULES) {
                    _styleSheet = _createStylesheet();
                }
                _styleSheets[selector] = _styleSheet;
            }
            if (_cssBlock !== null) {
                _cssBlock.styleSheets[selector] = _rules[selector];
                // finish this later
                return;
            }
            _updateStylesheet(selector);
        };

        _css.style = function (elements, styles, immediate) {
            if (elements === undefined || elements === null) {
                //utils.log('css.style invalid elements: '+ elements +' '+ JSON.stringify(styles) +' '+ immediate);
                return;
            }
            if (elements.length === undefined) {
                elements = [elements];
            }

            var cssRules = {};
            _updateStyleAttributes(cssRules, styles);

            if (_cssBlock !== null && !immediate) {
                elements.__cssRules = _extend(elements.__cssRules, cssRules);
                if (jwplayer._.indexOf(_cssBlock.elements, elements) < 0) {
                    _cssBlock.elements.push(elements);
                }
                // finish this later
                return;
            }
            _updateElementsStyle(elements, cssRules);
        };

        _css.block = function (id) {
            // use id so that the first blocker gets to unblock
            if (_cssBlock === null) {
                // console.time('block_'+id);
                _cssBlock = {
                    id: id,
                    styleSheets: {},
                    elements: []
                };
            }
        };

        _css.unblock = function (id) {
            if (_cssBlock && (!id || _cssBlock.id === id)) {
                // IE9 limits the number of style tags in the head, so we need to update the entire stylesheet each time
                for (var selector in _cssBlock.styleSheets) {
                    _updateStylesheet(selector);
                }

                for (var i = 0; i < _cssBlock.elements.length; i++) {
                    var elements = _cssBlock.elements[i];
                    _updateElementsStyle(elements, elements.__cssRules);
                }

                _cssBlock = null;
                // console.timeEnd('block_'+id);
            }
        };

        function _extend(target, source) {
            target = target || {};
            for (var prop in source) {
                target[prop] = source[prop];
            }
            return target;
        }

        function _updateStyles(cssRules, styles, important) {
            var dirty = false,
                style, val;
            for (style in styles) {
                val = _styleValue(style, styles[style], important);
                if (val !== '') {
                    if (val !== cssRules[style]) {
                        cssRules[style] = val;
                        dirty = true;
                    }
                } else if (cssRules[style] !== undefined) {
                    delete cssRules[style];
                    dirty = true;
                }
            }
            return dirty;
        }

        function _updateStyleAttributes(cssRules, styles) {
            for (var style in styles) {
                cssRules[style] = _styleValue(style, styles[style]);
            }
        }

        function _styleAttributeName(name) {
            name = name.split('-');
            for (var i = 1; i < name.length; i++) {
                name[i] = name[i].charAt(0).toUpperCase() + name[i].slice(1);
            }
            return name.join('');
        }

        function _styleValue(style, value, important) {
            if (!utils.exists(value)) {
                return '';
            }
            var importantString = important ? ' !important' : '';

            //string
            if (typeof value === 'string' && isNaN(value)) {
                if ((/png|gif|jpe?g/i).test(value) && value.indexOf('url') < 0) {
                    return 'url(' + value + ')';
                }
                return value + importantString;
            }
            // number
            if (value === 0 ||
                style === 'z-index' ||
                style === 'opacity') {
                return '' + value + importantString;
            }
            if ((/color/i).test(style)) {
                return '#' + utils.pad(value.toString(16).replace(/^0x/i, ''), 6) + importantString;
            }
            return Math.ceil(value) + 'px' + importantString;
        }

        function _updateElementsStyle(elements, cssRules) {
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i],
                    style, styleName;
                if (element !== undefined && element !== null) {
                    for (style in cssRules) {
                        styleName = _styleAttributeName(style);
                        if (element.style[styleName] !== cssRules[style]) {
                            element.style[styleName] = cssRules[style];
                        }
                    }
                }
            }
        }

        function _updateStylesheet(selector) {
            var sheet = _styleSheets[selector].sheet,
                cssRules,
                ruleIndex,
                ruleText;
            if (sheet) {
                cssRules = sheet.cssRules;
                ruleIndex = _ruleIndexes[selector];
                ruleText = _getRuleText(selector);

                if (ruleIndex !== undefined && ruleIndex < cssRules.length &&
                    cssRules[ruleIndex].selectorText === selector) {
                    if (ruleText === cssRules[ruleIndex].cssText) {
                        //no update needed
                        return;
                    }
                    sheet.deleteRule(ruleIndex);
                } else {
                    ruleIndex = cssRules.length;
                    _ruleIndexes[selector] = ruleIndex;
                }
                _insertRule(sheet, ruleText, ruleIndex);
            }
        }

        function _insertRule(sheet, text, index) {
            try {
                sheet.insertRule(text, index);
            } catch (e) {
                //console.log(e.message, text);
            }
        }

        function _getRuleText(selector) {
            var styles = _rules[selector];
            selector += ' { ';
            for (var style in styles) {
                selector += style + ': ' + styles[style] + '; ';
            }
            return selector + '}';
        }


        // Removes all css elements which match a particular style
        utils.clearCss = function (filter) {
            for (var rule in _rules) {
                if (rule.indexOf(filter) >= 0) {
                    delete _rules[rule];
                }
            }
            for (var selector in _styleSheets) {
                if (selector.indexOf(filter) >= 0) {
                    _updateStylesheet(selector);
                }
            }
        };

        utils.transform = function (element, value) {
            var transform = 'transform',
                style = {};
            value = value || '';
            style[transform] = value;
            style['-webkit-' + transform] = value;
            style['-ms-' + transform] = value;
            style['-moz-' + transform] = value;
            style['-o-' + transform] = value;
            if (typeof element === 'string') {
                _css(element, style);
            } else {
                _css.style(element, style);
            }
        };

        utils.dragStyle = function (selector, style) {
            _css(selector, {
                '-webkit-user-select': style,
                '-moz-user-select': style,
                '-ms-user-select': style,
                '-webkit-user-drag': style,
                'user-select': style,
                'user-drag': style
            });
        };

        utils.transitionStyle = function (selector, style) {
            // Safari 5 has problems with CSS3 transitions
            if (navigator.userAgent.match(/5\.\d(\.\d)? safari/i)) {
                return;
            }

            _css(selector, {
                '-webkit-transition': style,
                '-moz-transition': style,
                '-o-transition': style,
                transition: style
            });
        };


        utils.rotate = function (domelement, deg) {
            utils.transform(domelement, 'rotate(' + deg + 'deg)');
        };

        utils.rgbHex = function (color) {
            var hex = String(color).replace('#', '');
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            return '#' + hex.substr(-6);
        };

        utils.hexToRgba = function (hexColor, opacity) {
            var style = 'rgb';
            var channels = [
                parseInt(hexColor.substr(1, 2), 16),
                parseInt(hexColor.substr(3, 2), 16),
                parseInt(hexColor.substr(5, 2), 16)
            ];
            if (opacity !== undefined && opacity !== 100) {
                style += 'a';
                channels.push(opacity / 100);
            }
            return style + '(' + channels.join(',') + ')';
        };

    })(jwplayer);
    (function (utils) {
        var video = 'video/',
            audio = 'audio/',
            mp4 = 'mp4',
            webm = 'webm',
            ogg = 'ogg',
            aac = 'aac',
            mp3 = 'mp3',
            vorbis = 'vorbis',
            _ = jwplayer._,
            _foreach = utils.foreach,

            mimeMap = {
                mp4: video + mp4,
                ogg: video + ogg,
                oga: audio + ogg,
                vorbis: audio + ogg,
                webm: video + webm,
                aac: audio + mp4,
                mp3: audio + 'mpeg',
                hls: 'application/vnd.apple.mpegurl'
            },

            html5Extensions = {
                'mp4': mimeMap[mp4],
                'f4v': mimeMap[mp4],
                'm4v': mimeMap[mp4],
                'mov': mimeMap[mp4],
                'm4a': mimeMap[aac],
                'f4a': mimeMap[aac],
                'aac': mimeMap[aac],
                'mp3': mimeMap[mp3],
                'ogv': mimeMap[ogg],
                'ogg': mimeMap[ogg],
                'oga': mimeMap[vorbis],
                'vorbis': mimeMap[vorbis],
                'webm': mimeMap[webm],
                'm3u8': mimeMap.hls,
                'm3u': mimeMap.hls,
                'hls': mimeMap.hls
            },
            videoX = 'video',
            flashExtensions = {
                'flv': videoX,
                'f4v': videoX,
                'mov': videoX,
                'm4a': videoX,
                'm4v': videoX,
                'mp4': videoX,
                'aac': videoX,
                'f4a': videoX,
                'mp3': 'sound',
                'smil': 'rtmp',
                'm3u8': 'hls',
                'hls': 'hls'
            };

        var _extensionmap = utils.extensionmap = {};
        _foreach(html5Extensions, function (ext, val) {
            _extensionmap[ext] = {
                html5: val
            };
        });

        _foreach(flashExtensions, function (ext, val) {
            if (!_extensionmap[ext]) {
                _extensionmap[ext] = {};
            }
            _extensionmap[ext].flash = val;
        });

        _extensionmap.types = mimeMap;

        _extensionmap.mimeType = function (mime) {
            // return the first mime that matches
            var returnType;
            _.find(mimeMap, function (val, key) {
                if (val === mime) {
                    returnType = key;
                    return true;
                }
            });
            return returnType;
        };

        _extensionmap.extType = function (extension) {
            return _extensionmap.mimeType(html5Extensions[extension]);
        };

    })(jwplayer.utils);
    (function (utils) {

        var _loaderstatus = utils.loaderstatus = {
            NEW: 0,
            LOADING: 1,
            ERROR: 2,
            COMPLETE: 3
        };


        utils.scriptloader = function (url) {
            var _events = jwplayer.events,
                _this = utils.extend(this, new _events.eventdispatcher()),
                _status = _loaderstatus.NEW;

            this.load = function () {
                // Only execute on the first run
                if (_status !== _loaderstatus.NEW) {
                    return;
                }

                // If we already have a scriptloader loading the same script, don't create a new one;
                var sameLoader = utils.scriptloader.loaders[url];
                if (sameLoader) {
                    _status = sameLoader.getStatus();
                    if (_status < 2) {
                        // dispatch to this instances listeners when the first loader gets updates
                        sameLoader.addEventListener(_events.ERROR, _sendError);
                        sameLoader.addEventListener(_events.COMPLETE, _sendComplete);
                        return;
                    }
                    // already errored or loaded... keep going?
                }

                var head = document.getElementsByTagName('head')[0] || document.documentElement;
                var scriptTag = document.createElement('script');

                var done = false;
                scriptTag.onload = scriptTag.onreadystatechange = function (evt) {
                    if (!done &&
                       (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                        done = true;
                        _sendComplete(evt);

                        // Handle memory leak in IE
                        scriptTag.onload = scriptTag.onreadystatechange = null;
                        if (head && scriptTag.parentNode) {
                            head.removeChild(scriptTag);
                        }
                    }
                };
                scriptTag.onerror = _sendError;

                scriptTag.src = url;
                head.insertBefore(scriptTag, head.firstChild);

                _status = _loaderstatus.LOADING;
                utils.scriptloader.loaders[url] = this;
            };

            function _sendError(evt) {
                _status = _loaderstatus.ERROR;
                _this.sendEvent(_events.ERROR, evt);
            }

            function _sendComplete(evt) {
                _status = _loaderstatus.COMPLETE;
                _this.sendEvent(_events.COMPLETE, evt);
            }


            this.getStatus = function () {
                return _status;
            };
        };

        utils.scriptloader.loaders = {};
    })(jwplayer.utils);
    /**
     * String utilities for the JW Player.
     *
     * @version 6.0
     */
    (function (utils) {
        /** Removes whitespace from the beginning and end of a string **/
        utils.trim = function (inputString) {
            return inputString.replace(/^\s+|\s+$/g, '');
        };

        /**
         * Pads a string
         * @param {String} string
         * @param {Number} length
         * @param {String} padder
         */
        utils.pad = function (str, length, padder) {
            if (!padder) {
                padder = '0';
            }
            while (str.length < length) {
                str = padder + str;
            }
            return str;
        };

        /**
         * Get the value of a case-insensitive attribute in an XML node
         * @param {XML} xml
         * @param {String} attribute
         * @return {String} Value
         */
        utils.xmlAttribute = function (xml, attribute) {
            for (var attrib = 0; attrib < xml.attributes.length; attrib++) {
                if (xml.attributes[attrib].name && xml.attributes[attrib].name.toLowerCase() === attribute.toLowerCase()) {
                    return xml.attributes[attrib].value.toString();
                }
            }
            return '';
        };

        /**
         * This does not return the file extension, instead it returns a media type extension
         */
        function getAzureFileFormat(path) {
            if (path.indexOf('(format=m3u8-') > -1) {
                return 'm3u8';
            } else {
                return false;
            }
        }

        utils.extension = function (path) {
            if (!path || path.substr(0, 4) === 'rtmp') {
                return '';
            }

            var azureFormat = getAzureFileFormat(path);
            if (azureFormat) {
                return azureFormat;
            }

            path = path.substring(path.lastIndexOf('/') + 1, path.length).split('?')[0].split('#')[0];
            if (path.lastIndexOf('.') > -1) {
                return path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
            }
        };

        /** Convert a string representation of a string to an integer **/
        utils.stringToColor = function (value) {
            value = value.replace(/(#|0x)?([0-9A-F]{3,6})$/gi, '$2');
            if (value.length === 3) {
                value = value.charAt(0) + value.charAt(0) + value.charAt(1) +
                    value.charAt(1) + value.charAt(2) + value.charAt(2);
            }
            return parseInt(value, 16);
        };


    })(jwplayer.utils);
    (function (utils) {

        var TOUCH_MOVE = 'touchmove',
            TOUCH_START = 'touchstart',
            TOUCH_END = 'touchend',
            TOUCH_CANCEL = 'touchcancel';

        utils.touch = function (elem) {
            var _elem = elem,
                _isListening = false,
                _handlers = {},
                _startEvent = null,
                _gotMove = false,
                _events = utils.touchEvents;

            document.addEventListener(TOUCH_MOVE, touchHandler);
            document.addEventListener(TOUCH_END, documentEndHandler);
            document.addEventListener(TOUCH_CANCEL, touchHandler);
            elem.addEventListener(TOUCH_START, touchHandler);
            elem.addEventListener(TOUCH_END, touchHandler);

            function documentEndHandler(evt) {
                if (_isListening) {
                    if (_gotMove) {
                        triggerEvent(_events.DRAG_END, evt);
                    }
                }
                _gotMove = false;
                _isListening = false;
                _startEvent = null;
            }

            function touchHandler(evt) {
                if (evt.type === TOUCH_START) {
                    _isListening = true;
                    _startEvent = createEvent(_events.DRAG_START, evt);
                }
                else if (evt.type === TOUCH_MOVE) {
                    if (_isListening) {
                        if (_gotMove) {
                            triggerEvent(_events.DRAG, evt);
                        }
                        else {
                            triggerEvent(_events.DRAG_START, evt, _startEvent);
                            _gotMove = true;
                            triggerEvent(_events.DRAG, evt);
                        }
                    }
                }
                else {
                    if (_isListening) {
                        if (_gotMove) {
                            triggerEvent(_events.DRAG_END, evt);
                        }
                        else {
                            // This allows the controlbar/dock/logo tap events not to be forwarded to the view
                            evt.cancelBubble = true;
                            triggerEvent(_events.TAP, evt);
                        }
                    }
                    _gotMove = false;
                    _isListening = false;
                    _startEvent = null;
                }
            }

            function triggerEvent(type, srcEvent, finalEvt) {
                if (_handlers[type]) {
                    preventDefault(srcEvent);
                    var evt = finalEvt ? finalEvt : createEvent(type, srcEvent);
                    if (evt) {
                        _handlers[type](evt);
                    }
                }
            }

            function createEvent(type, srcEvent) {
                var touch = null;
                if (srcEvent.touches && srcEvent.touches.length) {
                    touch = srcEvent.touches[0];
                }
                else if (srcEvent.changedTouches && srcEvent.changedTouches.length) {
                    touch = srcEvent.changedTouches[0];
                }
                if (!touch) {
                    return null;
                }
                var rect = _elem.getBoundingClientRect();
                var evt = {
                    type: type,
                    target: _elem,
                    x: ((touch.pageX - window.pageXOffset) - rect.left),
                    y: touch.pageY,
                    deltaX: 0,
                    deltaY: 0
                };
                if (type !== _events.TAP && _startEvent) {
                    evt.deltaX = evt.x - _startEvent.x;
                    evt.deltaY = evt.y - _startEvent.y;
                }
                return evt;
            }

            function preventDefault(evt) {
                if (evt.preventManipulation) {
                    evt.preventManipulation();
                }
                if (evt.preventDefault) {
                    evt.preventDefault();
                }
            }

            this.addEventListener = function (type, handler) {
                _handlers[type] = handler;
            };

            this.removeEventListener = function (type) {
                delete _handlers[type];
            };

            return this;
        };

    })(jwplayer.utils); (function (utils) {
        utils.touchEvents = {
            DRAG: 'jwplayerDrag',
            DRAG_START: 'jwplayerDragStart',
            DRAG_END: 'jwplayerDragEnd',
            TAP: 'jwplayerTap'
        };

    })(jwplayer.utils);
    /**
     * Event namespace definition for the JW Player
     *
     * @author pablo
     * @version 6.0
     */
    (function (jwplayer) {
        jwplayer.events = {
            // General Events
            COMPLETE: 'COMPLETE',
            ERROR: 'ERROR',

            // API Events
            API_READY: 'jwplayerAPIReady',
            JWPLAYER_READY: 'jwplayerReady',
            JWPLAYER_FULLSCREEN: 'jwplayerFullscreen',
            JWPLAYER_RESIZE: 'jwplayerResize',
            JWPLAYER_ERROR: 'jwplayerError',
            JWPLAYER_SETUP_ERROR: 'jwplayerSetupError',

            // Media Events
            JWPLAYER_MEDIA_BEFOREPLAY: 'jwplayerMediaBeforePlay',
            JWPLAYER_MEDIA_BEFORECOMPLETE: 'jwplayerMediaBeforeComplete',
            JWPLAYER_MEDIA_BUFFER: 'jwplayerMediaBuffer',
            JWPLAYER_MEDIA_BUFFER_FULL: 'jwplayerMediaBufferFull',
            JWPLAYER_MEDIA_ERROR: 'jwplayerMediaError',
            JWPLAYER_MEDIA_LOADED: 'jwplayerMediaLoaded',
            JWPLAYER_MEDIA_COMPLETE: 'jwplayerMediaComplete',
            JWPLAYER_MEDIA_SEEK: 'jwplayerMediaSeek',
            JWPLAYER_MEDIA_TIME: 'jwplayerMediaTime',
            JWPLAYER_MEDIA_VOLUME: 'jwplayerMediaVolume',
            JWPLAYER_MEDIA_META: 'jwplayerMediaMeta',
            JWPLAYER_MEDIA_MUTE: 'jwplayerMediaMute',
            JWPLAYER_AUDIO_TRACKS: 'jwplayerAudioTracks',
            JWPLAYER_AUDIO_TRACK_CHANGED: 'jwplayerAudioTrackChanged',
            JWPLAYER_MEDIA_LEVELS: 'jwplayerMediaLevels',
            JWPLAYER_MEDIA_LEVEL_CHANGED: 'jwplayerMediaLevelChanged',
            JWPLAYER_CAPTIONS_CHANGED: 'jwplayerCaptionsChanged',
            JWPLAYER_CAPTIONS_LIST: 'jwplayerCaptionsList',
            JWPLAYER_CAPTIONS_LOADED: 'jwplayerCaptionsLoaded',

            // State events
            JWPLAYER_PLAYER_STATE: 'jwplayerPlayerState',
            state: {
                BUFFERING: 'BUFFERING',
                IDLE: 'IDLE',
                PAUSED: 'PAUSED',
                PLAYING: 'PLAYING'
            },

            // Playlist Events
            JWPLAYER_PLAYLIST_LOADED: 'jwplayerPlaylistLoaded',
            JWPLAYER_PLAYLIST_ITEM: 'jwplayerPlaylistItem',
            JWPLAYER_PLAYLIST_COMPLETE: 'jwplayerPlaylistComplete',

            // Display CLick
            JWPLAYER_DISPLAY_CLICK: 'jwplayerViewClick',
            JWPLAYER_PROVIDER_CLICK: 'jwplayerProviderClick',

            JWPLAYER_VIEW_TAB_FOCUS: 'jwplayerViewTabFocus',

            // Controls show/hide 
            JWPLAYER_CONTROLS: 'jwplayerViewControls',
            JWPLAYER_USER_ACTION: 'jwplayerUserAction',

            // Instream events
            JWPLAYER_INSTREAM_CLICK: 'jwplayerInstreamClicked',
            JWPLAYER_INSTREAM_DESTROYED: 'jwplayerInstreamDestroyed',

            // Ad events
            JWPLAYER_AD_TIME: 'jwplayerAdTime',
            JWPLAYER_AD_ERROR: 'jwplayerAdError',
            JWPLAYER_AD_CLICK: 'jwplayerAdClicked',
            JWPLAYER_AD_COMPLETE: 'jwplayerAdComplete',
            JWPLAYER_AD_IMPRESSION: 'jwplayerAdImpression',
            JWPLAYER_AD_COMPANIONS: 'jwplayerAdCompanions',
            JWPLAYER_AD_SKIPPED: 'jwplayerAdSkipped',
            JWPLAYER_AD_PLAY: 'jwplayerAdPlay',
            JWPLAYER_AD_PAUSE: 'jwplayerAdPause',
            JWPLAYER_AD_META: 'jwplayerAdMeta',


            // Casting
            JWPLAYER_CAST_AVAILABLE: 'jwplayerCastAvailable',
            JWPLAYER_CAST_SESSION: 'jwplayerCastSession',
            JWPLAYER_CAST_AD_CHANGED: 'jwplayerCastAdChanged'

        };

    })(jwplayer);
    (function (jwplayer) {
        var events = jwplayer.events,
            _utils = jwplayer.utils;

        events.eventdispatcher = function (id, debug) {
            var _id = id,
                _debug = debug,
                _listeners,
                _globallisteners;

            /** Clears all event listeners **/
            this.resetEventListeners = function () {
                _listeners = {};
                _globallisteners = [];
            };

            this.resetEventListeners();

            /** Add an event listener for a specific type of event. **/
            this.addEventListener = function (type, listener, count) {
                try {
                    if (!_utils.exists(_listeners[type])) {
                        _listeners[type] = [];
                    }

                    if (_utils.typeOf(listener) === 'string') {
                        /*jshint evil:true*/
                        listener = (new Function('return ' + listener))();
                    }
                    _listeners[type].push({
                        listener: listener,
                        count: count || null
                    });
                } catch (err) {
                    _utils.log('error', err);
                }
                return false;
            };

            /** Remove an event listener for a specific type of event. **/
            this.removeEventListener = function (type, listener) {
                var listenerIndex;
                if (!_listeners[type]) {
                    return;
                }
                try {
                    if (listener === undefined) {
                        _listeners[type] = [];
                        return;
                    }
                    for (listenerIndex = 0; listenerIndex < _listeners[type].length; listenerIndex++) {
                        if (_listeners[type][listenerIndex].listener.toString() === listener.toString()) {
                            _listeners[type].splice(listenerIndex, 1);
                            break;
                        }
                    }
                } catch (err) {
                    _utils.log('error', err);
                }
                return false;
            };

            /** Add an event listener for all events. **/
            this.addGlobalListener = function (listener, count) {
                try {
                    if (_utils.typeOf(listener) === 'string') {
                        /*jshint evil:true*/
                        listener = (new Function('return ' + listener))();
                    }
                    _globallisteners.push({
                        listener: listener,
                        count: count || null
                    });
                } catch (err) {
                    _utils.log('error', err);
                }
                return false;
            };

            /** Add an event listener for all events. **/
            this.removeGlobalListener = function (listener) {
                if (!listener) {
                    return;
                }
                try {
                    for (var index = _globallisteners.length; index--;) {
                        if (_globallisteners[index].listener.toString() === listener.toString()) {
                            _globallisteners.splice(index, 1);
                        }
                    }
                } catch (err) {
                    _utils.log('error', err);
                }
                return false;
            };


            /** Send an event **/
            this.sendEvent = function (type, data) {
                if (!_utils.exists(data)) {
                    data = {};
                }
                _utils.extend(data, {
                    id: _id,
                    version: jwplayer.version,
                    type: type
                });
                if (_debug) {
                    _utils.log(type, data);
                }
                dispatchEvent(_listeners[type], data, type);
                dispatchEvent(_globallisteners, data, type);
            };

            function dispatchEvent(listeners, data, type) {
                if (!listeners) {
                    return;
                }
                for (var index = 0; index < listeners.length; index++) {
                    var listener = listeners[index];
                    if (listener) {
                        if (listener.count !== null && --listener.count === 0) {
                            delete listeners[index];
                        }
                        try {
                            listener.listener(data);
                        } catch (err) {
                            _utils.log('错误处理"' + type +
                                '"事件监听器 [' + index + ']: ' + err.toString(), listener.listener, data);
                        }
                    }
                }
            }
        };
    })(window.jwplayer);
    /**
     * Plugin package definition
     * @author zach
     * @version 5.5
     */
    (function (jwplayer) {
        var _plugins = {},
            _pluginLoaders = {};

        jwplayer.plugins = function () { };

        jwplayer.plugins.loadPlugins = function (id, config) {
            _pluginLoaders[id] = new jwplayer.plugins.pluginloader(new jwplayer.plugins.model(_plugins), config);
            return _pluginLoaders[id];
        };

        jwplayer.plugins.registerPlugin = function (id, target, arg1, arg2) {
            var pluginId = jwplayer.utils.getPluginName(id);
            if (!_plugins[pluginId]) {
                _plugins[pluginId] = new jwplayer.plugins.plugin(id);
            }
            _plugins[pluginId].registerPlugin(id, target, arg1, arg2);
        };

    })(jwplayer);
    (function (jwplayer) {
        jwplayer.plugins.model = function (plugins) {
            this.addPlugin = function (url) {
                var pluginName = jwplayer.utils.getPluginName(url);
                if (!plugins[pluginName]) {
                    plugins[pluginName] = new jwplayer.plugins.plugin(url);
                }
                return plugins[pluginName];
            };

            this.getPlugins = function () {
                return plugins;
            };

        };

    })(jwplayer);
    (function (plugins) {
        var utils = jwplayer.utils,
            events = jwplayer.events,
            UNDEFINED = 'undefined';

        plugins.pluginmodes = {
            FLASH: 0,
            JAVASCRIPT: 1,
            HYBRID: 2
        };

        plugins.plugin = function (url) {
            var _status = utils.loaderstatus.NEW,
                _flashPath,
                _js,
                _target,
                _completeTimeout;

            var _eventDispatcher = new events.eventdispatcher();
            utils.extend(this, _eventDispatcher);

            function getJSPath() {
                switch (utils.getPluginPathType(url)) {
                    case utils.pluginPathType.ABSOLUTE:
                        return url;
                    case utils.pluginPathType.RELATIVE:
                        return utils.getAbsolutePath(url, window.location.href);
                }
            }

            function completeHandler() {
                _completeTimeout = setTimeout(function () {
                    _status = utils.loaderstatus.COMPLETE;
                    _eventDispatcher.sendEvent(events.COMPLETE);
                }, 1000);
            }

            function errorHandler() {
                _status = utils.loaderstatus.ERROR;
                _eventDispatcher.sendEvent(events.ERROR, { url: url });
            }

            this.load = function () {
                if (_status === utils.loaderstatus.NEW) {
                    if (url.lastIndexOf('.swf') > 0) {
                        _flashPath = url;
                        _status = utils.loaderstatus.COMPLETE;
                        _eventDispatcher.sendEvent(events.COMPLETE);
                        return;
                    } else if (utils.getPluginPathType(url) === utils.pluginPathType.CDN) {
                        _status = utils.loaderstatus.COMPLETE;
                        _eventDispatcher.sendEvent(events.COMPLETE);
                        return;
                    }
                    _status = utils.loaderstatus.LOADING;
                    var _loader = new utils.scriptloader(getJSPath());
                    // Complete doesn't matter - we're waiting for registerPlugin
                    _loader.addEventListener(events.COMPLETE, completeHandler);
                    _loader.addEventListener(events.ERROR, errorHandler);
                    _loader.load();
                }
            };

            this.registerPlugin = function (id, target, arg1, arg2) {
                if (_completeTimeout) {
                    clearTimeout(_completeTimeout);
                    _completeTimeout = undefined;
                }
                _target = target;
                if (arg1 && arg2) {
                    _flashPath = arg2;
                    _js = arg1;
                } else if (typeof arg1 === 'string') {
                    _flashPath = arg1;
                } else if (typeof arg1 === 'function') {
                    _js = arg1;
                } else if (!arg1 && !arg2) {
                    _flashPath = id;
                }
                _status = utils.loaderstatus.COMPLETE;
                _eventDispatcher.sendEvent(events.COMPLETE);
            };

            this.getStatus = function () {
                return _status;
            };

            this.getPluginName = function () {
                return utils.getPluginName(url);
            };

            this.getFlashPath = function () {
                if (_flashPath) {
                    switch (utils.getPluginPathType(_flashPath)) {
                        case utils.pluginPathType.ABSOLUTE:
                            return _flashPath;
                        case utils.pluginPathType.RELATIVE:
                            if (url.lastIndexOf('.swf') > 0) {
                                return utils.getAbsolutePath(_flashPath, window.location.href);
                            }
                            return utils.getAbsolutePath(_flashPath, getJSPath());
                            //                    case utils.pluginPathType.CDN:
                            //                        if (_flashPath.indexOf('-') > -1){
                            //                            return _flashPath+'h';
                            //                        }
                            //                        return _flashPath+'-h';
                    }
                }
                return null;
            };

            this.getJS = function () {
                return _js;
            };

            this.getTarget = function () {
                return _target;
            };

            this.getPluginmode = function () {
                if (typeof _flashPath !== UNDEFINED && typeof _js !== UNDEFINED) {
                    return plugins.pluginmodes.HYBRID;
                } else if (typeof _flashPath !== UNDEFINED) {
                    return plugins.pluginmodes.FLASH;
                } else if (typeof _js !== UNDEFINED) {
                    return plugins.pluginmodes.JAVASCRIPT;
                }
            };

            this.getNewInstance = function (api, config, div) {
                return new _js(api, config, div);
            };

            this.getURL = function () {
                return url;
            };
        };

    })(jwplayer.plugins);
    (function (jwplayer) {
        var utils = jwplayer.utils,
            events = jwplayer.events,
            _ = jwplayer._,
            _foreach = utils.foreach;

        jwplayer.plugins.pluginloader = function (model, config) {
            var _status = utils.loaderstatus.NEW,
                _loading = false,
                _iscomplete = false,
                _config = config,
                _pluginCount = _.size(_config),
                _pluginLoaded,
                _destroyed = false,
                _eventDispatcher = new events.eventdispatcher();


            utils.extend(this, _eventDispatcher);

            /*
             * Plugins can be loaded by multiple players on the page, but all of them use
             * the same plugin model singleton. This creates a race condition because
             * multiple players are creating and triggering loads, which could complete
             * at any time. We could have some really complicated logic that deals with
             * this by checking the status when it's created and / or having the loader
             * redispatch its current status on load(). Rather than do this, we just check
             * for completion after all of the plugins have been created. If all plugins
             * have been loaded by the time checkComplete is called, then the loader is
             * done and we fire the complete event. If there are new loads, they will
             * arrive later, retriggering the completeness check and triggering a complete
             * to fire, if necessary.
             */
            function _complete() {
                if (!_iscomplete) {
                    _iscomplete = true;
                    _status = utils.loaderstatus.COMPLETE;
                    _eventDispatcher.sendEvent(events.COMPLETE);
                }
            }

            // This is not entirely efficient, but it's simple
            function _checkComplete() {
                // Since we do not remove event listeners on pluginObj when destroying
                if (_destroyed) {
                    return;
                }
                if (!_config || _.keys(_config).length === 0) {
                    _complete();
                }
                if (!_iscomplete) {
                    var plugins = model.getPlugins();
                    _pluginLoaded = _.after(_pluginCount, _complete);
                    utils.foreach(_config, function (plugin) {
                        var pluginName = utils.getPluginName(plugin),
                            pluginObj = plugins[pluginName],
                            js = pluginObj.getJS(),
                            target = pluginObj.getTarget(),
                            status = pluginObj.getStatus();

                        if (status === utils.loaderstatus.LOADING || status === utils.loaderstatus.NEW) {
                            return;
                        } else if (js && !utils.versionCheck(target)) {
                            _eventDispatcher.sendEvent(events.ERROR, {
                                message: '不相容的播放器版本'
                            });
                        }
                        _pluginLoaded();
                    });

                }
            }

            function _pluginError(e) {
                // Since we do not remove event listeners on pluginObj when destroying
                if (_destroyed) {
                    return;
                }

                var message = '文件未找到';
                _eventDispatcher.sendEvent(events.ERROR, {
                    message: message
                });
                if (e.url) {
                    utils.log(message, e.url);
                }
                _checkComplete();
            }

            this.setupPlugins = function (api, config, resizer) {
                var flashPlugins = {
                    length: 0,
                    plugins: {}
                },
                    jsplugins = {
                        length: 0,
                        plugins: {}
                    },

                    plugins = model.getPlugins();

                _foreach(config.plugins, function (plugin, pluginConfig) {
                    var pluginName = utils.getPluginName(plugin),
                        pluginObj = plugins[pluginName],
                        flashPath = pluginObj.getFlashPath(),
                        jsPlugin = pluginObj.getJS(),
                        pluginURL = pluginObj.getURL();


                    if (flashPath) {
                        flashPlugins.plugins[flashPath] = utils.extend({}, pluginConfig);
                        flashPlugins.plugins[flashPath].pluginmode = pluginObj.getPluginmode();
                        flashPlugins.length++;
                    }

                    try {
                        if (jsPlugin && config.plugins && config.plugins[pluginURL]) {
                            var div = document.createElement('div');
                            div.id = api.id + '_' + pluginName;
                            div.style.position = 'absolute';
                            div.style.top = 0;
                            div.style.zIndex = jsplugins.length + 10;
                            jsplugins.plugins[pluginName] = pluginObj.getNewInstance(api,
                                utils.extend({}, config.plugins[pluginURL]), div);
                            jsplugins.length++;
                            api.onReady(resizer(jsplugins.plugins[pluginName], div, true));
                            api.onResize(resizer(jsplugins.plugins[pluginName], div));
                        }
                    } catch (err) {
                        utils.log('错误：加载失败' + pluginName + '.');
                    }
                });

                api.plugins = jsplugins.plugins;

                return flashPlugins;
            };

            this.load = function () {
                // Must be a hash map
                if (utils.exists(config) && utils.typeOf(config) !== 'object') {
                    _checkComplete();
                    return;
                }

                _status = utils.loaderstatus.LOADING;
                _loading = true;

                /** First pass to create the plugins and add listeners **/
                _foreach(config, function (plugin) {
                    if (utils.exists(plugin)) {
                        var pluginObj = model.addPlugin(plugin);
                        pluginObj.addEventListener(events.COMPLETE, _checkComplete);
                        pluginObj.addEventListener(events.ERROR, _pluginError);
                    }
                });

                var plugins = model.getPlugins();

                /** Second pass to actually load the plugins **/
                _foreach(plugins, function (plugin, pluginObj) {
                    // Plugin object ensures that it's only loaded once
                    pluginObj.load();
                });

                _loading = false;

                // Make sure we're not hanging around waiting for plugins that already finished loading
                _checkComplete();
            };

            this.destroy = function () {
                _destroyed = true;

                if (_eventDispatcher) {
                    _eventDispatcher.resetEventListeners();
                    _eventDispatcher = null;
                }
            };

            this.pluginFailed = _pluginError;

            this.getStatus = function () {
                return _status;
            };

        };

    })(jwplayer);
    /**
     * Parsers namespace declaration
     *
     * @author pablo
     * @version 6.0
     */
    (function (jwplayer) {

        jwplayer.parsers = {
            localName: function (node) {
                if (!node) {
                    return '';
                } else if (node.localName) {
                    return node.localName;
                } else if (node.baseName) {
                    return node.baseName;
                } else {
                    return '';
                }
            },
            textContent: function (node) {
                if (!node) {
                    return '';
                } else if (node.textContent) {
                    return jwplayer.utils.trim(node.textContent);
                } else if (node.text) {
                    return jwplayer.utils.trim(node.text);
                } else {
                    return '';
                }
            },
            getChildNode: function (parent, index) {
                return parent.childNodes[index];
            },
            numChildren: function (parent) {
                if (parent.childNodes) {
                    return parent.childNodes.length;
                } else {
                    return 0;
                }
            }

        };
    })(jwplayer);
    /**
     * Parse a feed item for JWPlayer content.
     *
     * @author zach
     * @modified pablo
     * @version 6.0
     */
    (function (jwplayer) {
        var _parsers = jwplayer.parsers;

        var jwparser = _parsers.jwparser = function () { };

        var PREFIX = 'jwplayer';

        /**
         * Parse a feed entry for JWPlayer content.
         *
         * @param {XML}
         *            obj The XML object to parse.
         * @param {Object}
         *            itm The playlistentry to amend the object to.
         * @return {Object} The playlistentry, amended with the JWPlayer info.
         */
        jwparser.parseEntry = function (obj, itm) {
            var sources = [],
                tracks = [],
                _xmlAttribute = jwplayer.utils.xmlAttribute,
                def = 'default',
                label = 'label',
                file = 'file',
                type = 'type';
            for (var i = 0; i < obj.childNodes.length; i++) {
                var node = obj.childNodes[i];
                if (node.prefix === PREFIX) {
                    var _localName = _parsers.localName(node);
                    if (_localName === 'source') {
                        delete itm.sources;
                        sources.push({
                            file: _xmlAttribute(node, file),
                            'default': _xmlAttribute(node, def),
                            label: _xmlAttribute(node, label),
                            type: _xmlAttribute(node, type)
                        });
                    } else if (_localName === 'track') {
                        delete itm.tracks;
                        tracks.push({
                            file: _xmlAttribute(node, file),
                            'default': _xmlAttribute(node, def),
                            kind: _xmlAttribute(node, 'kind'),
                            label: _xmlAttribute(node, label)
                        });
                    } else {
                        itm[_localName] = jwplayer.utils.serialize(_parsers.textContent(node));
                        if (_localName === 'file' && itm.sources) {
                            // jwplayer namespace file should override existing source
                            // (probably set in MediaParser)
                            delete itm.sources;
                        }
                    }

                }
                if (!itm[file]) {
                    itm[file] = itm.link;
                }
            }


            if (sources.length) {
                itm.sources = [];
                for (i = 0; i < sources.length; i++) {
                    if (sources[i].file.length > 0) {
                        sources[i][def] = (sources[i][def] === 'true') ? true : false;
                        if (!sources[i].label.length) {
                            delete sources[i].label;
                        }
                        itm.sources.push(sources[i]);
                    }
                }
            }

            if (tracks.length) {
                itm.tracks = [];
                for (i = 0; i < tracks.length; i++) {
                    if (tracks[i].file.length > 0) {
                        tracks[i][def] = (tracks[i][def] === 'true') ? true : false;
                        tracks[i].kind = (!tracks[i].kind.length) ? 'captions' : tracks[i].kind;
                        if (!tracks[i].label.length) {
                            delete tracks[i].label;
                        }
                        itm.tracks.push(tracks[i]);
                    }
                }
            }
            return itm;
        };
    })(jwplayer);
    /**
     * Parse a MRSS group into a playlistitem (used in RSS and ATOM).
     *
     * author zach
     * modified pablo
     * version 6.0
     */
    (function (parsers) {
        var utils = jwplayer.utils,
            _xmlAttribute = utils.xmlAttribute,
            _localName = parsers.localName,
            _textContent = parsers.textContent,
            _numChildren = parsers.numChildren;


        var mediaparser = parsers.mediaparser = function () { };

        /** Prefix for the MRSS namespace. **/
        var PREFIX = 'media';

        /**
         * Parse a feeditem for Yahoo MediaRSS extensions.
         * The 'content' and 'group' elements can nest other MediaRSS elements.
         * @param	{XML}		obj		The entire MRSS XML object.
         * @param	{Object}	itm		The playlistentry to amend the object to.
         * @return	{Object}			The playlistentry, amended with the MRSS info.
         **/
        mediaparser.parseGroup = function (obj, itm) {
            var node,
                i,
                tracks = 'tracks',
                captions = [];

            function getLabel(code) {
                var LANGS = {
                    'zh': 'Chinese',
                    'nl': 'Dutch',
                    'en': 'English',
                    'fr': 'French',
                    'de': 'German',
                    'it': 'Italian',
                    'ja': 'Japanese',
                    'pt': 'Portuguese',
                    'ru': 'Russian',
                    'es': 'Spanish'
                };

                if (LANGS[code]) {
                    return LANGS[code];
                }
                return code;
            }

            for (i = 0; i < _numChildren(obj) ; i++) {
                node = obj.childNodes[i];
                if (node.prefix === PREFIX) {
                    if (!_localName(node)) {
                        continue;
                    }
                    switch (_localName(node).toLowerCase()) {
                        case 'content':
                            //itm['file'] = _xmlAttribute(node, 'url');
                            if (_xmlAttribute(node, 'duration')) {
                                itm.duration = utils.seconds(_xmlAttribute(node, 'duration'));
                            }
                            if (_numChildren(node) > 0) {
                                itm = mediaparser.parseGroup(node, itm);
                            }
                            if (_xmlAttribute(node, 'url')) {
                                if (!itm.sources) {
                                    itm.sources = [];
                                }
                                itm.sources.push({
                                    file: _xmlAttribute(node, 'url'),
                                    type: _xmlAttribute(node, 'type'),
                                    width: _xmlAttribute(node, 'width'),
                                    label: _xmlAttribute(node, 'label')
                                });
                            }
                            break;
                        case 'title':
                            itm.title = _textContent(node);
                            break;
                        case 'description':
                            itm.description = _textContent(node);
                            break;
                        case 'guid':
                            itm.mediaid = _textContent(node);
                            break;
                        case 'thumbnail':
                            if (!itm.image) {
                                itm.image = _xmlAttribute(node, 'url');
                            }
                            break;
                        case 'player':
                            // var url = node.url;
                            break;
                        case 'group':
                            mediaparser.parseGroup(node, itm);
                            break;
                        case 'subtitle':
                            var entry = {};
                            entry.file = _xmlAttribute(node, 'url');
                            entry.kind = 'captions';
                            if (_xmlAttribute(node, 'lang').length > 0) {
                                entry.label = getLabel(_xmlAttribute(node, 'lang'));
                            }
                            captions.push(entry);
                    }
                }
            }

            if (!itm.hasOwnProperty(tracks)) {
                itm[tracks] = [];
            }

            for (i = 0; i < captions.length; i++) {
                itm[tracks].push(captions[i]);
            }

            return itm;
        };

    })(jwplayer.parsers);
    /**
     * Parse an RSS feed and translate it to a playlist.
     *
     * @author zach
     * @modified pablo
     * @version 6.0
     */
    (function (parsers) {
        var utils = jwplayer.utils,
            _textContent = parsers.textContent,
            _getChildNode = parsers.getChildNode,
            _numChildren = parsers.numChildren,
            _localName = parsers.localName;

        parsers.rssparser = {};


        /**
         * Parse an RSS playlist for feed items.
         *
         * @param {XML} dat
         * @reuturn {Array} playlistarray
         */
        parsers.rssparser.parse = function (dat) {
            var arr = [];
            for (var i = 0; i < _numChildren(dat) ; i++) {
                var node = _getChildNode(dat, i),
                    localName = _localName(node).toLowerCase();
                if (localName === 'channel') {
                    for (var j = 0; j < _numChildren(node) ; j++) {
                        var subNode = _getChildNode(node, j);
                        if (_localName(subNode).toLowerCase() === 'item') {
                            arr.push(_parseItem(subNode));
                        }
                    }
                }
            }
            return arr;
        };


        /** 
         * Translate RSS item to playlist item.
         *
         * @param {XML} obj
         * @return {PlaylistItem} PlaylistItem
         */
        function _parseItem(obj) {
            var itm = {};
            for (var i = 0; i < obj.childNodes.length; i++) {
                var node = obj.childNodes[i];
                var localName = _localName(node);
                if (!localName) {
                    continue;
                }
                switch (localName.toLowerCase()) {
                    case 'enclosure':
                        itm.file = utils.xmlAttribute(node, 'url');
                        break;
                    case 'title':
                        itm.title = _textContent(node);
                        break;
                    case 'guid':
                        itm.mediaid = _textContent(node);
                        break;
                    case 'pubdate':
                        itm.date = _textContent(node);
                        break;
                    case 'description':
                        itm.description = _textContent(node);
                        break;
                    case 'link':
                        itm.link = _textContent(node);
                        break;
                    case 'category':
                        if (itm.tags) {
                            itm.tags += _textContent(node);
                        } else {
                            itm.tags = _textContent(node);
                        }
                        break;
                }
            }
            itm = parsers.mediaparser.parseGroup(obj, itm);
            itm = parsers.jwparser.parseEntry(obj, itm);

            return new jwplayer.playlist.item(itm);
        }




    })(jwplayer.parsers);
    (function (jwplayer) {

        var utils = jwplayer.utils;
        var _ = jwplayer._;

        jwplayer.playlist = function (playlist) {
            var _playlist = [];

            // Can be either an array of items or a single item.
            playlist = (_.isArray(playlist) ? playlist : [playlist]);

            _.each(playlist, function (item) {
                _playlist.push(new jwplayer.playlist.item(item));
            });

            return _playlist;
        };

        /** Go through the playlist and choose a single playable type to play; remove sources of a different type **/
        jwplayer.playlist.filterPlaylist = function (playlist, androidhls) {
            var list = [];

            _.each(playlist, function (item) {
                item = utils.extend({}, item);
                item.sources = _filterSources(item.sources, false, androidhls);

                if (!item.sources.length) {
                    return;
                }

                // If the source doesn't have a label, number it
                for (var j = 0; j < item.sources.length; j++) {
                    item.sources[j].label = item.sources[j].label || j.toString();
                }

                list.push(item);
            });

            return list;
        };

        function _parseSource(source) {

            // file is the only hard requirement
            if (!source || !source.file) { return; }

            var file = utils.trim('' + source.file);
            var type = source.type;

            // If type not included, we infer it from extension
            if (!type) {
                var extension = utils.extension(file);
                type = utils.extensionmap.extType(extension);
            }

            return utils.extend({}, source, { file: file, type: type });
        }

        /** Filters the sources by taking the first playable type and eliminating sources of a different type **/
        var _filterSources = jwplayer.playlist.filterSources = function (sources, filterFlash, androidhls) {
            var selectedType,
                newSources = [],
                canPlay = (filterFlash ? jwplayer.embed.flashCanPlay : jwplayer.embed.html5CanPlay);

            if (!sources) { return; }

            _.each(sources, function (originalSource) {
                var source = _parseSource(originalSource);

                if (!source) { return; }

                if (canPlay(source.file, source.type, androidhls)) {
                    // We want sources of all the same type since they may be of different quality levels
                    selectedType = selectedType || source.type;

                    if (source.type === selectedType) {
                        newSources.push(source);
                    }
                }
            });

            return newSources;
        };

    })(jwplayer);
    (function (playlist) {
        var _item = playlist.item = function (config) {
            var utils = jwplayer.utils,
                _playlistitem = utils.extend({}, _item.defaults, config),
                i, j, def;

            _playlistitem.tracks = (config && utils.exists(config.tracks)) ? config.tracks : [];

            if (_playlistitem.sources.length === 0) {
                _playlistitem.sources = [new playlist.source(_playlistitem)];
            }

            /** Each source should be a named object **/
            for (i = 0; i < _playlistitem.sources.length; i++) {
                def = _playlistitem.sources[i]['default'];
                if (def) {
                    _playlistitem.sources[i]['default'] = (def.toString() === 'true');
                } else {
                    _playlistitem.sources[i]['default'] = false;
                }

                _playlistitem.sources[i] = new playlist.source(_playlistitem.sources[i]);
            }

            if (_playlistitem.captions && !utils.exists(config.tracks)) {
                for (j = 0; j < _playlistitem.captions.length; j++) {
                    _playlistitem.tracks.push(_playlistitem.captions[j]);
                }
                delete _playlistitem.captions;
            }

            for (i = 0; i < _playlistitem.tracks.length; i++) {
                _playlistitem.tracks[i] = new playlist.track(_playlistitem.tracks[i]);
            }
            return _playlistitem;
        };

        _item.defaults = {
            description: undefined,
            image: undefined,
            mediaid: undefined,
            title: undefined,
            sources: [],
            tracks: []
        };

    })(jwplayer.playlist);
    (function (jwplayer) {
        var utils = jwplayer.utils,
            events = jwplayer.events,
            parsers = jwplayer.parsers;

        jwplayer.playlist.loader = function () {
            var _eventDispatcher = new events.eventdispatcher();
            utils.extend(this, _eventDispatcher);

            this.load = function (playlistfile) {
                utils.ajax(playlistfile, _playlistLoaded, _playlistLoadError);
            };

            function _playlistLoaded(loadedEvent) {
                try {
                    var childNodes = loadedEvent.responseXML.childNodes;
                    var rss = '';
                    for (var i = 0; i < childNodes.length; i++) {
                        rss = childNodes[i];
                        if (rss.nodeType !== 8) { // 8: Node.COMMENT_NODE (IE8 doesn't have the Node.COMMENT_NODE constant)
                            break;
                        }
                    }

                    if (parsers.localName(rss) === 'xml') {
                        rss = rss.nextSibling;
                    }

                    if (parsers.localName(rss) !== 'rss') {
                        _playlistError('不是有效的RSS提要');
                        return;
                    }

                    var pl = new jwplayer.playlist(parsers.rssparser.parse(rss));
                    _eventDispatcher.sendEvent(events.JWPLAYER_PLAYLIST_LOADED, {
                        playlist: pl
                    });
                } catch (e) {
                    _playlistError();
                }
            }

            function _playlistLoadError(err) {
                _playlistError(err.match(/invalid/i) ? '不是有效的RSS提要' : '');
            }

            function _playlistError(msg) {
                _eventDispatcher.sendEvent(events.JWPLAYER_ERROR, {
                    message: msg ? msg : '加载文件错误'
                });
            }
        };
    })(jwplayer);
    (function (playlist) {
        var utils = jwplayer.utils,
            defaults = {
                file: undefined,
                label: undefined,
                type: undefined,
                'default': undefined
            };

        playlist.source = function (config) {
            var _source = utils.extend({}, defaults);

            utils.foreach(defaults, function (property) {
                if (utils.exists(config[property])) {
                    _source[property] = config[property];
                    // Actively move from config to source
                    delete config[property];
                }
            });

            if (_source.type && _source.type.indexOf('/') > 0) {
                _source.type = utils.extensionmap.mimeType(_source.type);
            }
            if (_source.type === 'm3u8') {
                _source.type = 'hls';
            }
            if (_source.type === 'smil') {
                _source.type = 'rtmp';
            }
            return _source;
        };

    })(jwplayer.playlist);
    (function (playlist) {
        var utils = jwplayer.utils,
            defaults = {
                file: undefined,
                label: undefined,
                kind: 'captions',
                'default': false
            };

        playlist.track = function (config) {
            var _track = utils.extend({}, defaults);
            if (!config) {
                config = {};
            }

            utils.foreach(defaults, function (property) {
                if (utils.exists(config[property])) {
                    _track[property] = config[property];
                    // Actively move from config to track
                    delete config[property];
                }
            });

            return _track;
        };

    })(jwplayer.playlist);
    (function (jwplayer) {
        var utils = jwplayer.utils,
            events = jwplayer.events,
            _ = jwplayer._;

        var embed = jwplayer.embed = function (playerApi) {

            var _config = new embed.config(playerApi.config),
                _width = _config.width,
                _height = _config.height,
                _errorText = '加载错误: ',
                _oldContainer = document.getElementById(playerApi.id),
                _pluginloader = jwplayer.plugins.loadPlugins(playerApi.id, _config.plugins),
                _loader,
                _playlistLoading = false,
                _errorOccurred = false,
                _playerEmbedder = null,
                _setupErrorTimer = -1,
                _this = this;

            _config.id = playerApi.id;
            if (_config.aspectratio) {
                playerApi.config.aspectratio = _config.aspectratio;
            } else {
                delete playerApi.config.aspectratio;
            }

            _setupEvents(playerApi, _config.events);

            var _container = document.createElement('div');
            _container.id = _oldContainer.id;
            _container.style.width = _width.toString().indexOf('%') > 0 ? _width : (_width + 'px');
            _container.style.height = _height.toString().indexOf('%') > 0 ? _height : (_height + 'px');

            _this.embed = function () {
                if (_errorOccurred) {
                    return;
                }

                _pluginloader.addEventListener(events.COMPLETE, _doEmbed);
                _pluginloader.addEventListener(events.ERROR, _pluginError);
                _pluginloader.load();
            };

            _this.destroy = function () {
                if (_playerEmbedder) {
                    _playerEmbedder.destroy();
                    _playerEmbedder = null;
                }
                if (_pluginloader) {
                    _pluginloader.destroy();
                    _pluginloader = null;
                }
                if (_loader) {
                    _loader.resetEventListeners();
                    _loader = null;
                }
            };

            function _doEmbed() {
                if (_errorOccurred) {
                    return;
                }

                var playlist = _config.playlist;

                // Check for common playlist errors
                if (_.isArray(playlist)) {
                    if (playlist.length === 0) {
                        _sourceError();
                        return;
                    }

                    // If single item playlist and it doesn't have any sources
                    if (playlist.length === 1) {
                        if (!playlist[0].sources || playlist[0].sources.length === 0 ||
                                !playlist[0].sources[0].file) {
                            _sourceError();
                            return;
                        }
                    }
                }

                if (_playlistLoading) {
                    return;
                }

                if (_.isString(playlist)) {
                    _loader = new jwplayer.playlist.loader();
                    _loader.addEventListener(events.JWPLAYER_PLAYLIST_LOADED, function (evt) {
                        _config.playlist = evt.playlist;
                        _playlistLoading = false;
                        _doEmbed();
                    });
                    _loader.addEventListener(events.JWPLAYER_ERROR, function (evt) {
                        _playlistLoading = false;
                        _sourceError(evt);
                    });
                    _playlistLoading = true;
                    _loader.load(_config.playlist);
                    return;
                }

                if (_pluginloader.getStatus() === utils.loaderstatus.COMPLETE) {
                    for (var i = 0; i < _config.modes.length; i++) {
                        var mode = _config.modes[i];
                        var type = mode.type;
                        if (type && embed[type]) {
                            var configClone = utils.extend({}, _config);
                            _playerEmbedder = new embed[type](_container, mode, configClone,
                                _pluginloader, playerApi);

                            if (_playerEmbedder.supportsConfig()) {
                                _playerEmbedder.addEventListener(events.ERROR, _embedError);
                                _playerEmbedder.embed();
                                _insertCSS();
                                return playerApi;
                            }
                        }
                    }

                    var message;
                    if (_config.fallback) {
                        message = '找不到合适的播放器并启用后退功能 ';
                        _dispatchSetupError(message, true);
                        utils.log(message);
                        new embed.download(_container, _config, _sourceError);
                    } else {
                        message = '找不到合适的播放器并启用后退功能';
                        _dispatchSetupError(message, false);
                        utils.log(message);
                    }
                }
            }

            function _embedError(evt) {
                _errorScreen(_errorText + evt.message);
            }

            function _pluginError(evt) {
                playerApi.dispatchEvent(events.JWPLAYER_ERROR, {
                    message: '无法加载插件 : ' + evt.message
                });
            }

            function _sourceError(evt) {
                if (evt && evt.message) {
                    _errorScreen('加载错误列表 : ' + evt.message);
                } else {
                    _errorScreen(_errorText + '请升级 <a style=\'color:white\' target=\'_blank\' href=\'https://get2.adobe.com/cn/flashplayer/\'>Adobe - Flash Player</a>');
                }
            }

            function _dispatchSetupError(message, fallback) {
                // Throttle this so that it runs once if called twice in the same callstack
                clearTimeout(_setupErrorTimer);
                _setupErrorTimer = setTimeout(function () {
                    playerApi.dispatchEvent(events.JWPLAYER_SETUP_ERROR, {
                        message: message,
                        fallback: fallback
                    });
                }, 0);
            }

            function _errorScreen(message) {
                if (_errorOccurred) {
                    return;
                }

                // Put new container in page
                _oldContainer.parentNode.replaceChild(_container, _oldContainer);

                if (!_config.fallback) {
                    _dispatchSetupError(message, false);
                    return;
                }

                _errorOccurred = true;
                _displayError(_container, message, _config);
                _dispatchSetupError(message, true);
            }

            _this.errorScreen = _errorScreen;

            return _this;
        };

        function _setupEvents(api, events) {
            utils.foreach(events, function (evt, val) {
                var fn = api[evt];
                if (typeof fn === 'function') {
                    fn.call(api, val);
                }
            });
        }

        function _insertCSS() {
            utils.css('object.jwswf, .jwplayer:focus', {
                outline: 'none'
            });
            utils.css('.jw-tab-focus:focus', {
                outline: 'solid 2px #0B7EF4'
            });
        }

        function _displayError(container, message, config) {
            var style = container.style;
            style.backgroundColor = '#000';
            style.color = '#FFF';
            style.width = utils.styleDimension(config.width);
            style.height = utils.styleDimension(config.height);
            style.display = 'table';
            style.opacity = 1;

            var text = document.createElement('p'),
                textStyle = text.style;
            textStyle.verticalAlign = 'middle';
            textStyle.textAlign = 'center';
            textStyle.display = 'table-cell';
            textStyle.font = '15px/20px  Arial, Helvetica, sans-serif';
            text.innerHTML = message.replace(':', ':<br>');

            container.innerHTML = '';
            container.appendChild(text);
        }

        // Make this publicly accessible so the HTML5 player can error out on setup using the same code
        jwplayer.embed.errorScreen = _displayError;

    })(jwplayer);
    (function (jwplayer) {
        var utils = jwplayer.utils,
            embed = jwplayer.embed,
            playlistitem = jwplayer.playlist.item;

        var config = embed.config = function (config) {

            var _defaults = {
                fallback: true, // enable download embedder
                height: 270,
                primary: 'html5',
                width: 480,
                base: config.base ? config.base : utils.getScriptPath('jwplayer.js'),
                aspectratio: ''
            },
                _config = utils.extend({}, _defaults, jwplayer.defaults, config),
                _modes = {
                    html5: {
                        type: 'html5',
                        src: _config.base + 'jwplayer.html5.js'
                    },
                    flash: {
                        type: 'flash',
                        src: _config.base + 'jwplayer.flash.swf'
                    }
                };

            // No longer allowing user-set modes block as of 6.0
            _config.modes = (_config.primary === 'flash') ? [_modes.flash, _modes.html5] : [_modes.html5, _modes.flash];

            if (_config.listbar) {
                _config.playlistsize = _config.listbar.size;
                _config.playlistposition = _config.listbar.position;
                _config.playlistlayout = _config.listbar.layout;
            }

            if (_config.flashplayer) { _modes.flash.src = _config.flashplayer; }
            if (_config.html5player) { _modes.html5.src = _config.html5player; }

            _normalizePlaylist(_config);

            evaluateAspectRatio(_config);

            return _config;
        };

        function evaluateAspectRatio(config) {
            var ar = config.aspectratio,
                ratio = getRatio(ar);
            if (config.width.toString().indexOf('%') === -1) {
                delete config.aspectratio;
            } else if (!ratio) {
                delete config.aspectratio;
            } else {
                config.aspectratio = ratio;
            }
        }

        function getRatio(ar) {
            if (typeof ar !== 'string' || !utils.exists(ar)) {
                return 0;
            }
            var index = ar.indexOf(':');
            if (index === -1) {
                return 0;
            }
            var w = parseFloat(ar.substr(0, index)),
                h = parseFloat(ar.substr(index + 1));
            if (w <= 0 || h <= 0) {
                return 0;
            }
            return (h / w * 100) + '%';
        }

        /** Appends a new configuration onto an old one; used for mode configuration **/
        config.addConfig = function (oldConfig, newConfig) {
            _normalizePlaylist(newConfig);
            return utils.extend(oldConfig, newConfig);
        };

        /** Construct a playlist from base-level config elements **/
        function _normalizePlaylist(config) {
            if (!config.playlist) {
                var singleItem = {};

                utils.foreach(playlistitem.defaults, function (itemProp) {
                    _moveProperty(config, singleItem, itemProp);
                });

                if (!singleItem.sources) {
                    if (config.levels) {
                        singleItem.sources = config.levels;
                        delete config.levels;
                    } else {
                        var singleSource = {};
                        _moveProperty(config, singleSource, 'file');
                        _moveProperty(config, singleSource, 'type');
                        singleItem.sources = singleSource.file ? [singleSource] : [];
                    }
                }

                config.playlist = [new playlistitem(singleItem)];
            } else {
                // Use JW Player playlist items to normalize sources of existing playlist items
                for (var i = 0; i < config.playlist.length; i++) {
                    config.playlist[i] = new playlistitem(config.playlist[i]);
                }
            }
        }

        function _moveProperty(sourceObj, destObj, property) {
            if (utils.exists(sourceObj[property])) {
                destObj[property] = sourceObj[property];
                delete sourceObj[property];
            }
        }

    })(jwplayer);
    (function (jwplayer) {
        var embed = jwplayer.embed,
            utils = jwplayer.utils,

            JW_CSS_NONE = 'none',
            JW_CSS_BLOCK = 'block',
            JW_CSS_100PCT = '100%',
            JW_CSS_RELATIVE = 'relative',
            JW_CSS_ABSOLUTE = 'absolute';

        // We cannot use jwplayer.utils.css due to an IE8 incompatability
        function _badCss(selector, style) {
            var elements = document.querySelectorAll(selector);

            function app(prop, val) {
                elements[i].style[prop] = val;
            }

            for (var i = 0; i < elements.length; i++) {
                utils.foreach(style, app);
            }
        }

        embed.download = function (_container, _options, _errorCallback) {
            var params = utils.extend({}, _options),
                _display,
                _width = params.width ? params.width : 480,
                _height = params.height ? params.height : 320,
                _file,
                _image,
                _logo = _options.logo ? _options.logo : {
                    prefix: utils.repo(),
                    file: 'logo.png',
                    margin: 10
                };


            function _embed() {
                var file, image, youtube, i, item, sources,
                    source, type,
                    playlist = params.playlist,
                    types = ['mp4', 'aac', 'mp3'];

                if (!playlist || !playlist.length) {
                    return;
                }

                item = playlist[0];
                sources = item.sources;
                // If no downloadable files, and youtube, display youtube
                // If nothing, show error message
                for (i = 0; i < sources.length; i++) {
                    source = sources[i];
                    if (!source.file) {
                        continue;
                    }

                    type = source.type || utils.extensionmap.extType(utils.extension(source.file));

                    var typeIndex = utils.indexOf(types, type);
                    if (typeIndex >= 0) {
                        file = source.file;
                        image = item.image;
                    } else if (utils.isYouTube(source.file, type)) {
                        youtube = source.file;
                    }
                }

                if (file) {
                    _file = file;
                    _image = image;
                    _buildElements();
                    _styleElements();
                } else if (youtube) {
                    _embedYouTube(youtube);
                } else {
                    _errorCallback();
                }
            }

            function _buildElements() {
                if (_container) {
                    _display = _createElement('a', 'display', _container);
                    _createElement('div', 'icon', _display);
                    _createElement('div', 'logo', _display);
                    if (_file) {
                        _display.setAttribute('href', utils.getAbsolutePath(_file));
                    }
                }
            }

            function _styleElements() {
                var _prefix = '#' + _container.id + ' .jwdownload';

                _container.style.width = '';
                _container.style.height = '';

                _badCss(_prefix + 'display', {
                    width: utils.styleDimension(Math.max(320, _width)),
                    height: utils.styleDimension(Math.max(180, _height)),
                    background: 'black center no-repeat ' + (_image ? 'url(' + _image + ')' : ''),
                    backgroundSize: 'contain',
                    position: JW_CSS_RELATIVE,
                    border: JW_CSS_NONE,
                    display: JW_CSS_BLOCK
                });

                _badCss(_prefix + 'display div', {
                    position: JW_CSS_ABSOLUTE,
                    width: JW_CSS_100PCT,
                    height: JW_CSS_100PCT
                });

                _badCss(_prefix + 'logo', {
                    top: _logo.margin + 'px',
                    right: _logo.margin + 'px',
                    background: 'top right no-repeat url(' + _logo.prefix + _logo.file + ')'
                });

                _badCss(_prefix + 'icon', {
                    /*jshint maxlen:9000*/
                    background: 'center no-repeat url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgNJREFUeNrs28lqwkAYB/CZqNVDDj2r6FN41QeIy8Fe+gj6BL275Q08u9FbT8ZdwVfotSBYEPUkxFOoks4EKiJdaDuTjMn3wWBO0V/+sySR8SNSqVRKIR8qaXHkzlqS9jCfzzWcTCYp9hF5o+59sVjsiRzcegSckFzcjT+ruN80TeSlAjCAAXzdJSGPFXRpAAMYwACGZQkSdhG4WCzehMNhqV6vG6vVSrirKVEw66YoSqDb7cqlUilE8JjHd/y1MQefVzqdDmiaJpfLZWHgXMHn8F6vJ1cqlVAkEsGuAn83J4gAd2RZymQygX6/L1erVQt+9ZPWb+CDwcCC2zXGJaewl/DhcHhK3DVj+KfKZrMWvFarcYNLomAv4aPRSFZVlTlcSPA5fDweW/BoNIqFnKV53JvncjkLns/n/cLdS+92O7RYLLgsKfv9/t8XlDn4eDyiw+HA9Jyz2eyt0+kY2+3WFC5hluej0Ha7zQQq9PPwdDq1Et1sNsx/nFBgCqWJ8oAK1aUptNVqcYWewE4nahfU0YQnk4ntUEfGMIU2m01HoLaCKbTRaDgKtaVLk9tBYaBcE/6Artdr4RZ5TB6/dC+9iIe/WgAMYADDpAUJAxjAAAYwgGFZgoS/AtNNTF7Z2bL0BYPBV3Jw5xFwwWcYxgtBP5OkE8i9G7aWGOOCruvauwADALMLMEbKf4SdAAAAAElFTkSuQmCC)'
                });

            }

            function _createElement(tag, className, parent) {
                var _element = document.createElement(tag);
                if (className) {
                    _element.className = 'jwdownload' + className;
                }
                if (parent) {
                    parent.appendChild(_element);
                }
                return _element;
            }

            /** 
             * Although this function creates a flash embed, the target is iOS,
             * which interprets the embed code as a YouTube video,
             * and plays it using the browser
             */
            function _embedYouTube(path) {
                var embed = _createElement('iframe', '', _container);

                embed.src = 'http://www.youtube.com/embed/' + utils.youTubeID(path);
                embed.width = _width;
                embed.height = _height;
                embed.style.border = 'none';
            }

            _embed();
        };

    })(jwplayer);
    (function (jwplayer) {
        /*jshint maxparams:5*/
        var utils = jwplayer.utils,
            events = jwplayer.events,
            storedFlashvars = {};

        var _flash = jwplayer.embed.flash = function (_container, _player, _options, _loader, _api) {
            var _eventDispatcher = new jwplayer.events.eventdispatcher(),
                _flashVersion = utils.flashVersion();
            utils.extend(this, _eventDispatcher);


            function appendAttribute(object, name, value) {
                var param = document.createElement('param');
                param.setAttribute('name', name);
                param.setAttribute('value', value);
                object.appendChild(param);
            }

            function _resizePlugin(plugin, div, onready) {
                return function () {
                    try {
                        if (onready) {
                            document.getElementById(_api.id + '_wrapper').appendChild(div);
                        }
                        var display = document.getElementById(_api.id).getPluginConfig('display');
                        if (typeof plugin.resize === 'function') {
                            plugin.resize(display.width, display.height);
                        }
                        div.style.left = display.x;
                        div.style.top = display.h;
                    } catch (e) { }
                };
            }

            function parsePlugins(pluginBlock) {
                if (!pluginBlock) {
                    return {};
                }

                var flat = {},
                    pluginKeys = [];

                utils.foreach(pluginBlock, function (plugin, pluginConfig) {
                    var pluginName = utils.getPluginName(plugin);
                    pluginKeys.push(plugin);
                    utils.foreach(pluginConfig, function (param, val) {
                        flat[pluginName + '.' + param] = val;
                    });
                });
                flat.plugins = pluginKeys.join(',');
                return flat;
            }

            this.embed = function () {
                // Make sure we're passing the correct ID into Flash for Linux API support
                _options.id = _api.id;

                // If Flash is installed, but the version is too low, display an error.
                if (_flashVersion < 10) {
                    _eventDispatcher.sendEvent(events.ERROR, {
                        message: '要求FLASH版本10或以上 建议升级flash版本'
                    });
                    return false;
                }

                var _wrapper,
                    _aspect,
                    id = _container.id,
                    lb = _api.config.listbar;

                var params = utils.extend({}, _options);

                // Put the new container into the page
                var replace = document.getElementById(_api.id);
                replace.parentNode.replaceChild(_container, replace);

                // Hack for when adding / removing happens too quickly
                if (id + '_wrapper' === _container.parentNode.id) {
                    _wrapper = document.getElementById(id + '_wrapper');
                } else {
                    _wrapper = document.createElement('div');
                    _aspect = document.createElement('div');
                    _aspect.style.display = 'none';
                    _aspect.id = id + '_aspect';
                    _wrapper.id = id + '_wrapper';
                    _wrapper.style.position = 'relative';
                    _wrapper.style.display = 'block';
                    _wrapper.style.width = utils.styleDimension(params.width);
                    _wrapper.style.height = utils.styleDimension(params.height);

                    if (_api.config.aspectratio) {
                        var ar = parseFloat(_api.config.aspectratio);
                        _aspect.style.display = 'block';
                        _aspect.style.marginTop = _api.config.aspectratio;
                        _wrapper.style.height = 'auto';
                        _wrapper.style.display = 'inline-block';
                        if (lb) {
                            if (lb.position === 'bottom') {
                                _aspect.style.paddingBottom = lb.size + 'px';
                            } else if (lb.position === 'right') {
                                _aspect.style.marginBottom = (-1 * lb.size * (ar / 100)) + 'px';
                            }
                        }
                    }

                    _container.parentNode.replaceChild(_wrapper, _container);
                    _wrapper.appendChild(_container);
                    _wrapper.appendChild(_aspect);

                }

                var flashPlugins = _loader.setupPlugins(_api, params, _resizePlugin);

                if (flashPlugins.length > 0) {
                    utils.extend(params, parsePlugins(flashPlugins.plugins));
                } else {
                    delete params.plugins;
                }

                // Hack for the dock
                if (typeof params['dock.position'] !== 'undefined') {
                    if (params['dock.position'].toString().toLowerCase() === 'false') {
                        params.dock = params['dock.position'];
                        delete params['dock.position'];
                    }
                }

                var bgcolor = '#000000',
                    flashPlayer, //flashvars,
                    wmode = params.wmode || (params.height && params.height <= 40 ? 'transparent' : 'opaque'),
                    toDelete = ['height', 'width', 'modes', 'events', 'primary', 'base', 'fallback', 'volume'];

                for (var i = 0; i < toDelete.length; i++) {
                    delete params[toDelete[i]];
                }

                // If we've set any cookies in HTML5 mode, bring them into flash
                var cookies = utils.getCookies();
                utils.foreach(cookies, function (cookie, val) {
                    if (typeof (params[cookie]) === 'undefined') {
                        params[cookie] = val;
                    }
                });

                var base = window.location.href.split('/');
                base.splice(base.length - 1, 1);
                base = base.join('/');
                params.base = base + '/';

                storedFlashvars[id] = params;

                if (utils.isMSIE()) {

                    _container.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' +
                        ' width="100%" height="100%" id="' + id +
                        '" name="' + id +
                        '" tabindex="0">' +
                        '<param name="movie" value="' + _player.src + '">' +
                        '<param name="allowfullscreen" value="true">' +
                        '<param name="allowscriptaccess" value="always">' +
                        '<param name="seamlesstabbing" value="true">' +
                        '<param name="wmode" value="' + wmode + '">' +
                        '<param name="bgcolor" value="' + bgcolor + '">' +
                        '</object>';

                    flashPlayer = _wrapper.getElementsByTagName('object')[0];
                    flashPlayer.style.outline = 'none';

                } else {
                    flashPlayer = document.createElement('object');
                    flashPlayer.setAttribute('type', 'application/x-shockwave-flash');
                    flashPlayer.setAttribute('data', _player.src);
                    flashPlayer.setAttribute('width', '100%');
                    flashPlayer.setAttribute('height', '100%');
                    flashPlayer.setAttribute('bgcolor', bgcolor);
                    flashPlayer.setAttribute('id', id);
                    flashPlayer.setAttribute('name', id);
                    flashPlayer.className = 'jwswf';
                    //obj.setAttribute('tabindex', 0);
                    appendAttribute(flashPlayer, 'allowfullscreen', 'true');
                    appendAttribute(flashPlayer, 'allowscriptaccess', 'always');
                    appendAttribute(flashPlayer, 'seamlesstabbing', 'true');
                    appendAttribute(flashPlayer, 'wmode', wmode);

                    _container.parentNode.replaceChild(flashPlayer, _container);
                }

                if (_api.config.aspectratio) {
                    flashPlayer.style.position = 'absolute';
                    flashPlayer.style.left = '0';
                }
                _api.container = flashPlayer;
                _api.setPlayer(flashPlayer, 'flash');
            };

            /**
             * Detects whether Flash supports this configuration
             */
            this.supportsConfig = function () {
                if (_flashVersion) {
                    if (_options) {
                        if (utils.typeOf(_options.playlist) === 'string') {
                            return true;
                        }

                        try {
                            var item = _options.playlist[0],
                                sources = item.sources;

                            if (typeof sources === 'undefined') {
                                return true;
                            } else {
                                for (var i = 0; i < sources.length; i++) {
                                    if (sources[i].file && _flashCanPlay(sources[i].file, sources[i].type)) {
                                        return true;
                                    }
                                }
                            }
                        } catch (e) {
                            return false;
                        }
                    } else {
                        return true;
                    }
                }
                return false;
            };

            // Removing the object from the page cleans everything up
            this.destroy = function () { };

        };

        _flash.getVars = function (id) {
            return storedFlashvars[id];
        };

        /**
         * Determines if a Flash can play a particular file, based on its extension
         */
        var _flashCanPlay = jwplayer.embed.flashCanPlay = function (file, type) {
            // TODO: Return false if isMobile

            if (utils.isYouTube(file, type)) { return true; }
            if (utils.isRtmp(file, type)) { return true; }
            if (type === 'hls') { return true; }

            var mappedType = utils.extensionmap[type ? type : utils.extension(file)];

            // If no type or unrecognized type, don't allow to play
            if (!mappedType) {
                return false;
            }

            return !!(mappedType.flash);
        };

    })(jwplayer);
    (function (jwplayer) {
        /*jshint maxparams:5*/
        var utils = jwplayer.utils,
            extensionmap = utils.extensionmap,
            events = jwplayer.events,
            scriptLoader;

        jwplayer.embed.html5 = function (_container, _player, _options, _loader, _api) {
            var _this = this,
                _eventdispatcher = new events.eventdispatcher();

            utils.extend(_this, _eventdispatcher);

            function _resizePlugin(plugin, div, onready) {
                return function () {
                    try {
                        var displayarea = document.querySelector('#' + _container.id + ' .jwmain');
                        if (onready) {
                            displayarea.appendChild(div);
                        }
                        if (typeof plugin.resize === 'function') {
                            plugin.resize(displayarea.clientWidth, displayarea.clientHeight);
                            setTimeout(function () {
                                plugin.resize(displayarea.clientWidth, displayarea.clientHeight);
                            }, 400);
                        }
                        div.left = displayarea.style.left;
                        div.top = displayarea.style.top;
                    } catch (e) { }
                };
            }

            _this.embed = function () {
                if (!jwplayer.html5) {
                    this.loadEmbedder();
                    return;
                }

                _loader.setupPlugins(_api, _options, _resizePlugin);
                utils.emptyElement(_container);
                var playerOptions = jwplayer.utils.extend({}, _options);

                // Volume option is tricky to remove, since it needs to be in the HTML5 player model.
                delete playerOptions.volume;

                var html5player = new jwplayer.html5.player(playerOptions);

                _api.setPlayer(html5player, 'html5');
            };

            this.loadEmbedder = function () {
                scriptLoader = scriptLoader || new utils.scriptloader(_player.src);
                scriptLoader.addEventListener(events.ERROR, this.loadError);
                scriptLoader.addEventListener(events.COMPLETE, this.embed);
                scriptLoader.load(); // Don't worry, it will only load once
            };

            this.loadError = function (evt) {
                this.sendEvent(evt.type, {
                    message: 'HTML5 PLAY播放器找不到'
                });
            };

            /**
             * Detects whether the html5 player supports this configuration.
             *
             * @return {Boolean}
             */
            _this.supportsConfig = function () {
                if (!!jwplayer.vid.canPlayType) {
                    try {
                        if (utils.typeOf(_options.playlist) === 'string') {
                            return true;
                        } else {
                            var sources = _options.playlist[0].sources;
                            for (var i = 0; i < sources.length; i++) {
                                var file = sources[i].file,
                                    type = sources[i].type;

                                if (jwplayer.embed.html5CanPlay(file, type, _options.androidhls)) {
                                    return true;
                                }
                            }
                        }
                    } catch (e) { }
                }
                return false;
            };

            _this.destroy = function () {
                if (scriptLoader) {
                    scriptLoader.resetEventListeners();
                    scriptLoader = null;
                }
            };
        };

        /**
         * Determines if a video element can play a particular file, based on its extension
         * @param {Object} file
         * @param {Object} type
         * @return {Boolean}
         */
        function _html5CanPlay(file, type, androidhls) {
            // HTML5 playback is not sufficiently supported on Blackberry devices; should fail over automatically.
            if (navigator.userAgent.match(/BlackBerry/i) !== null) {
                return false;
            }

            if (utils.isIE(9)) {
                return false;
            }
            // Youtube JavaScript API Provider
            if (utils.isYouTube(file, type)) {
                // TODO: check that js api requirements are met first
                // https://developers.google.com/youtube/js_api_reference
                return true;
            }

            var extension = utils.extension(file);
            type = type || extensionmap.extType(extension);

            // HLS not sufficiently supported on Android devices; should fail over automatically.
            if (type === 'hls') {
                //when androidhls is set to true, allow HLS playback on Android 4.1 and up
                if (androidhls) {
                    var isAndroidNative = utils.isAndroidNative;
                    if (isAndroidNative(2) || isAndroidNative(3) || isAndroidNative('4.0')) {
                        return false;
                    } else if (utils.isAndroid()) { //utils.isAndroidNative()) {
                        // skip canPlayType check
                        // canPlayType returns '' in native browser even though HLS will play
                        return true;
                    }
                } else if (utils.isAndroid()) {
                    return false;
                }
            }

            // Ensure RTMP files are not seen as videos
            if (utils.isRtmp(file, type)) {
                return false;
            }

            var mappedType = extensionmap[type] || extensionmap[extension];

            // If no type or unrecognized type, don't allow to play
            if (!mappedType) {
                return false;
            }

            // Extension is recognized as a format Flash can play, but no HTML5 support is listed  
            if (mappedType.flash && !mappedType.html5) {
                return false;
            }

            // Last, but not least, we ask the browser 
            // (But only if it's a video with an extension known to work in HTML5)
            return _browserCanPlay(mappedType.html5);
        }

        /**
         *
         * @param {DOMMediaElement} video
         * @param {String} mimetype
         * @return {Boolean}
         */
        function _browserCanPlay(mimetype) {
            // OK to use HTML5 with no extension
            if (!mimetype) {
                return true;
            }
            try {
                var result = jwplayer.vid.canPlayType(mimetype);
                return !!result;
            } catch (e) { }
            return false;
        }

        jwplayer.embed.html5CanPlay = _html5CanPlay;

    })(jwplayer);
    (function (jwplayer, undefined) {
        var _players = [],
            utils = jwplayer.utils,
            events = jwplayer.events,
            _ = jwplayer._,
            _uniqueIndex = 0,
            states = events.state;

        function addFocusBorder(container) {
            utils.addClass(container, 'jw-tab-focus');
        }

        function removeFocusBorder(container) {
            utils.removeClass(container, 'jw-tab-focus');
        }

        var _internalFuncsToGenerate = [
            'getBuffer',
            'getCaptionsList',
            'getControls',
            'getCurrentCaptions',
            'getCurrentQuality',
            'getCurrentAudioTrack',
            'getDuration',
            'getFullscreen',
            'getHeight',
            'getLockState',
            'getMute',
            'getPlaylistIndex',
            'getSafeRegion',
            'getPosition',
            'getQualityLevels',
            'getState',
            'getVolume',
            'getWidth',
            'isBeforeComplete',
            'isBeforePlay',
            'releaseState'
        ];

        var _chainableInternalFuncs = [
            'playlistNext',
            'stop',

            // The following pass an argument to function
            'forceState',
            'playlistPrev',
            'seek',
            'setCurrentCaptions',
            'setControls',
            'setCurrentQuality',
            'setVolume',
            'setCurrentAudioTrack'
        ];

        var _eventMapping = {
            onBufferChange: events.JWPLAYER_MEDIA_BUFFER,
            onBufferFull: events.JWPLAYER_MEDIA_BUFFER_FULL,
            onError: events.JWPLAYER_ERROR,
            onSetupError: events.JWPLAYER_SETUP_ERROR,
            onFullscreen: events.JWPLAYER_FULLSCREEN,
            onMeta: events.JWPLAYER_MEDIA_META,
            onMute: events.JWPLAYER_MEDIA_MUTE,
            onPlaylist: events.JWPLAYER_PLAYLIST_LOADED,
            onPlaylistItem: events.JWPLAYER_PLAYLIST_ITEM,
            onPlaylistComplete: events.JWPLAYER_PLAYLIST_COMPLETE,
            onReady: events.API_READY,
            onResize: events.JWPLAYER_RESIZE,
            onComplete: events.JWPLAYER_MEDIA_COMPLETE,
            onSeek: events.JWPLAYER_MEDIA_SEEK,
            onTime: events.JWPLAYER_MEDIA_TIME,
            onVolume: events.JWPLAYER_MEDIA_VOLUME,
            onBeforePlay: events.JWPLAYER_MEDIA_BEFOREPLAY,
            onBeforeComplete: events.JWPLAYER_MEDIA_BEFORECOMPLETE,
            onDisplayClick: events.JWPLAYER_DISPLAY_CLICK,
            onControls: events.JWPLAYER_CONTROLS,
            onQualityLevels: events.JWPLAYER_MEDIA_LEVELS,
            onQualityChange: events.JWPLAYER_MEDIA_LEVEL_CHANGED,
            onCaptionsList: events.JWPLAYER_CAPTIONS_LIST,
            onCaptionsChange: events.JWPLAYER_CAPTIONS_CHANGED,
            onAdError: events.JWPLAYER_AD_ERROR,
            onAdClick: events.JWPLAYER_AD_CLICK,
            onAdImpression: events.JWPLAYER_AD_IMPRESSION,
            onAdTime: events.JWPLAYER_AD_TIME,
            onAdComplete: events.JWPLAYER_AD_COMPLETE,
            onAdCompanions: events.JWPLAYER_AD_COMPANIONS,
            onAdSkipped: events.JWPLAYER_AD_SKIPPED,
            onAdPlay: events.JWPLAYER_AD_PLAY,
            onAdPause: events.JWPLAYER_AD_PAUSE,
            onAdMeta: events.JWPLAYER_AD_META,
            onCast: events.JWPLAYER_CAST_SESSION,
            onAudioTrackChange: events.JWPLAYER_AUDIO_TRACK_CHANGED,
            onAudioTracks: events.JWPLAYER_AUDIO_TRACKS
        };

        var _stateMapping = {
            onBuffer: states.BUFFERING,
            onPause: states.PAUSED,
            onPlay: states.PLAYING,
            onIdle: states.IDLE
        };

        jwplayer.api = function (container) {
            var _this = this,
                _listeners = {},
                _stateListeners = {},
                _player,
                _playerReady = false,
                _queuedCalls = [],
                _instream,
                _itemMeta = {},
                _callbacks = {};

            _this.container = container;
            _this.id = container.id;


            _this.setup = function (options) {
                if (jwplayer.embed) {

                    // Remove any players that may be associated to this DOM element
                    jwplayer.api.destroyPlayer(_this.id);

                    var newApi = (new jwplayer.api(_this.container));
                    jwplayer.api.addPlayer(newApi);

                    newApi.config = options;
                    newApi._embedder = new jwplayer.embed(newApi);
                    newApi._embedder.embed();
                    return newApi;
                }
                return _this;
            };

            _this.getContainer = function () {
                return _this.container;
            };

            _this.addButton = function (icon, label, handler, id) {
                try {
                    _callbacks[id] = handler;
                    var handlerString = 'jwplayer("' + _this.id + '").callback("' + id + '")';
                    //_player.jwDockAddButton(icon, label, handlerString, id);
                    _callInternal('jwDockAddButton', icon, label, handlerString, id);
                } catch (e) {
                    utils.log('无法添加停靠按钮 ' + e.message);
                }
            };
            _this.removeButton = function (id) {
                _callInternal('jwDockRemoveButton', id);
            };

            _this.callback = function (id) {
                if (_callbacks[id]) {
                    _callbacks[id]();
                }
            };

            _this.getMeta = function () {
                return _this.getItemMeta();
            };
            _this.getPlaylist = function () {
                var playlist = _callInternal('jwGetPlaylist');
                if (_this.renderingMode === 'flash') {
                    utils.deepReplaceKeyName(playlist,
                        ['__dot__', '__spc__', '__dsh__', '__default__'], ['.', ' ', '-', 'default']);
                }
                return playlist;
            };
            _this.getPlaylistItem = function (item) {
                if (!utils.exists(item)) {
                    item = _this.getPlaylistIndex();
                }
                return _this.getPlaylist()[item];
            };
            _this.getRenderingMode = function () {
                return _this.renderingMode;
            };

            // Player Public Methods
            _this.setFullscreen = function (fullscreen) {
                if (!utils.exists(fullscreen)) {
                    _callInternal('jwSetFullscreen', !_callInternal('jwGetFullscreen'));
                } else {
                    _callInternal('jwSetFullscreen', fullscreen);
                }
                return _this;
            };
            _this.setMute = function (mute) {
                if (!utils.exists(mute)) {
                    _callInternal('jwSetMute', !_callInternal('jwGetMute'));
                } else {
                    _callInternal('jwSetMute', mute);
                }
                return _this;
            };
            _this.lock = function () {
                return _this;
            };
            _this.unlock = function () {
                return _this;
            };
            _this.load = function (toLoad) {
                _callInternal('jwInstreamDestroy');
                if (jwplayer(_this.id).plugins.googima) {
                    _callInternal('jwDestroyGoogima');
                }
                _callInternal('jwLoad', toLoad);
                return _this;
            };
            _this.playlistItem = function (item) {
                _callInternal('jwPlaylistItem', parseInt(item, 10));
                return _this;
            };
            _this.resize = function (width, height) {
                if (_this.renderingMode !== 'flash') {
                    _callInternal('jwResize', width, height);
                } else {
                    var wrapper = document.getElementById(_this.id + '_wrapper'),
                        aspect = document.getElementById(_this.id + '_aspect');
                    if (aspect) {
                        aspect.style.display = 'none';
                    }
                    if (wrapper) {
                        wrapper.style.display = 'block';
                        wrapper.style.width = utils.styleDimension(width);
                        wrapper.style.height = utils.styleDimension(height);
                    }
                }
                return _this;
            };
            _this.play = function (state) {
                if (state !== undefined) {
                    _callInternal('jwPlay', state);
                    return _this;
                }

                state = _this.getState();
                var instreamState = _instream && _instream.getState();

                if (instreamState) {
                    if (instreamState === states.IDLE || instreamState === states.PLAYING ||
                        instreamState === states.BUFFERING) {
                        _callInternal('jwInstreamPause');
                    } else {
                        _callInternal('jwInstreamPlay');
                    }
                }

                if (state === states.PLAYING || state === states.BUFFERING) {
                    _callInternal('jwPause');
                } else {
                    _callInternal('jwPlay');
                }

                return _this;
            };

            _this.pause = function (state) {
                if (state === undefined) {
                    state = _this.getState();
                    if (state === states.PLAYING || state === states.BUFFERING) {
                        _callInternal('jwPause');
                    } else {
                        _callInternal('jwPlay');
                    }
                } else {
                    _callInternal('jwPause', state);
                }
                return _this;
            };
            _this.createInstream = function () {
                return new jwplayer.api.instream(this, _player);
            };
            _this.setInstream = function (instream) {
                _instream = instream;
                return instream;
            };
            _this.loadInstream = function (item, options) {
                _instream = _this.setInstream(_this.createInstream()).init(options);
                _instream.loadItem(item);
                return _instream;
            };
            _this.destroyPlayer = function () {
                // so players can be removed before loading completes
                _playerReady = true;
                _callInternal('jwPlayerDestroy');
            };
            _this.playAd = function (ad) {
                var plugins = jwplayer(_this.id).plugins;
                if (plugins.vast) {
                    plugins.vast.jwPlayAd(ad);
                } else {
                    _callInternal('jwPlayAd', ad);
                }
            };
            _this.pauseAd = function () {
                var plugins = jwplayer(_this.id).plugins;
                if (plugins.vast) {
                    plugins.vast.jwPauseAd();
                } else {
                    _callInternal('jwPauseAd');
                }
            };


            // Take a mapping of function names to event names and setup listeners
            function initializeMapping(mapping, listener) {
                utils.foreach(mapping, function (name, value) {
                    _this[name] = function (callback) {
                        return listener(value, callback);
                    };
                });
            }

            initializeMapping(_stateMapping, _stateListener);
            initializeMapping(_eventMapping, _eventListener);


            // given a name "getBuffer", it adds to jwplayer.api a function which internally triggers jwGetBuffer
            function generateInternalFunction(chainable, name) {
                var internalName = 'jw' + name.charAt(0).toUpperCase() + name.slice(1);

                _this[name] = function () {
                    var value = _callInternal.apply(this, [internalName].concat(Array.prototype.slice.call(arguments, 0)));
                    return (chainable ? _this : value);
                };
            }
            var nonChainingGenerator = function (index, name) {
                generateInternalFunction(false, name);
            };
            var chainingGenerator = function (index, name) {
                generateInternalFunction(true, name);
            };
            utils.foreach(_internalFuncsToGenerate, nonChainingGenerator);
            utils.foreach(_chainableInternalFuncs, chainingGenerator);


            _this.remove = function () {

                // Cancel embedding even if it is in progress
                if (this._embedder && this._embedder.destroy) {
                    this._embedder.destroy();
                }

                _queuedCalls = [];

                // Is there more than one player using the same DIV on the page?
                var sharedDOM = (_.size(_.where(_players, { id: _this.id })) > 1);

                // If sharing the DOM element, don't reset CSS
                if (!sharedDOM) {
                    utils.clearCss('#' + _this.id);
                }

                var toDestroy = document.getElementById(_this.id + (_this.renderingMode === 'flash' ? '_wrapper' : ''));

                if (toDestroy) {
                    if (_this.renderingMode === 'html5') {
                        // calls jwPlayerDestroy()
                        _this.destroyPlayer();
                    } else if (utils.isMSIE(8)) {
                        // remove flash object safely, setting flash external interface methods to null for ie8
                        var swf = document.getElementById(_this.id);
                        if (swf && swf.parentNode) {
                            swf.style.display = 'none';
                            for (var i in swf) {
                                if (typeof swf[i] === 'function') {
                                    swf[i] = null;
                                }
                            }
                            swf.parentNode.removeChild(swf);
                        }
                    }

                    // If the tag is reused by another player, do not destroy the div
                    if (!sharedDOM) {
                        var replacement = document.createElement('div');
                        replacement.id = _this.id;
                        toDestroy.parentNode.replaceChild(replacement, toDestroy);
                    }
                }

                // Remove from array of players
                _players = _.filter(_players, function (p) {
                    return (p.uniqueId !== _this.uniqueId);
                });
            };


            _this.registerPlugin = function (id, target, arg1, arg2) {
                jwplayer.plugins.registerPlugin(id, target, arg1, arg2);
            };

            /** Use this function to set the internal low-level player.
             * This is a javascript object which contains the low-level API calls. **/
            _this.setPlayer = function (player, renderingMode) {
                _player = player;
                _this.renderingMode = renderingMode;
            };

            _this.detachMedia = function () {
                if (_this.renderingMode === 'html5') {
                    return _callInternal('jwDetachMedia');
                }
            };

            _this.attachMedia = function (seekable) {
                if (_this.renderingMode === 'html5') {
                    return _callInternal('jwAttachMedia', seekable);
                }
            };


            _this.getAudioTracks = function () {
                return _callInternal('jwGetAudioTracks');
            };

            function _stateListener(state, callback) {
                if (!_stateListeners[state]) {
                    _stateListeners[state] = [];
                    _eventListener(events.JWPLAYER_PLAYER_STATE, _stateCallback(state));
                }
                _stateListeners[state].push(callback);
                return _this;
            }

            function _stateCallback(state) {
                return function (args) {
                    var newstate = args.newstate,
                        oldstate = args.oldstate;
                    if (newstate === state) {
                        var callbacks = _stateListeners[newstate];
                        if (callbacks) {
                            for (var c = 0; c < callbacks.length; c++) {
                                var fn = callbacks[c];
                                if (typeof fn === 'function') {
                                    fn.call(this, {
                                        oldstate: oldstate,
                                        newstate: newstate
                                    });
                                }
                            }
                        }
                    }
                };
            }

            function _addInternalListener(player, type) {
                try {
                    player.jwAddEventListener(type,
                            'function(dat) { jwplayer("' + _this.id + '").dispatchEvent("' + type + '", dat); }');
                } catch (e) {
                    if (_this.renderingMode === 'flash') {
                        var anchor = document.createElement('a');
                        anchor.href = _player.data;
                        if (anchor.protocol !== location.protocol) {
                            utils.log('警告 : 你的网站  [' + location.protocol + '] 和 JWPlayer [' + anchor.protocol +
                                '] 使用不同的协议托管');
                        }
                    }
                    utils.log('无法添加内部侦听器');
                }
            }

            function _eventListener(type, callback) {
                if (!_listeners[type]) {
                    _listeners[type] = [];
                    if (_player && _playerReady) {
                        _addInternalListener(_player, type);
                    }
                }
                _listeners[type].push(callback);
                return _this;
            }

            _this.removeEventListener = function (type, callback) {
                var listeners = _listeners[type];
                if (listeners) {
                    for (var l = listeners.length; l--;) {
                        if (listeners[l] === callback) {
                            listeners.splice(l, 1);
                        }
                    }
                }
            };

            _this.dispatchEvent = function (type) {
                var listeners = _listeners[type];
                if (listeners) {
                    listeners = listeners.slice(0); //copy array
                    var args = utils.translateEventResponse(type, arguments[1]);
                    for (var l = 0; l < listeners.length; l++) {
                        var fn = listeners[l];
                        if (typeof fn === 'function') {
                            try {
                                if (type === events.JWPLAYER_PLAYLIST_LOADED) {
                                    utils.deepReplaceKeyName(args.playlist,
                                        ['__dot__', '__spc__', '__dsh__', '__default__'], ['.', ' ', '-', 'default']);
                                }
                                fn.call(this, args);
                            } catch (e) {
                                utils.log('调用事件处理程序时出错。', e);
                            }
                        }
                    }
                }
            };

            _this.dispatchInstreamEvent = function (type) {
                if (_instream) {
                    _instream.dispatchEvent(type, arguments);
                }
            };

            function _callInternal() {
                if (_playerReady) {
                    if (_player) {
                        var args = Array.prototype.slice.call(arguments, 0),
                            funcName = args.shift();
                        if (typeof _player[funcName] === 'function') {
                            // Can't use apply here -- Flash's externalinterface doesn't like it.
                            //return func.apply(player, args);
                            switch (args.length) {
                                case 6:
                                    return _player[funcName](args[0], args[1], args[2], args[3], args[4], args[5]);
                                case 5:
                                    return _player[funcName](args[0], args[1], args[2], args[3], args[4]);
                                case 4:
                                    return _player[funcName](args[0], args[1], args[2], args[3]);
                                case 3:
                                    return _player[funcName](args[0], args[1], args[2]);
                                case 2:
                                    return _player[funcName](args[0], args[1]);
                                case 1:
                                    return _player[funcName](args[0]);
                            }
                            return _player[funcName]();
                        }
                    }
                    return null;
                }
                _queuedCalls.push(arguments);
            }

            _this.callInternal = _callInternal;

            _this.playerReady = function (obj) {
                _playerReady = true;

                if (!_player) {
                    _this.setPlayer(document.getElementById(obj.id));
                }
                _this.container = document.getElementById(_this.id);

                utils.foreach(_listeners, function (eventType) {
                    _addInternalListener(_player, eventType);
                });

                _eventListener(events.JWPLAYER_PLAYLIST_ITEM, function () {
                    _itemMeta = {};
                });

                _eventListener(events.JWPLAYER_MEDIA_META, function (data) {
                    utils.extend(_itemMeta, data.metadata);
                });

                _eventListener(events.JWPLAYER_VIEW_TAB_FOCUS, function (data) {
                    var container = _this.getContainer();
                    if (data.hasFocus === true) {
                        addFocusBorder(container);
                    } else {
                        removeFocusBorder(container);
                    }
                });

                _this.dispatchEvent(events.API_READY);

                while (_queuedCalls.length > 0) {
                    _callInternal.apply(_this, _queuedCalls.shift());
                }
            };

            _this.getItemMeta = function () {
                return _itemMeta;
            };

            return _this;
        };


        //
        // API Static methods
        //

        jwplayer.playerReady = function (obj) {
            var api = jwplayer.api.playerById(obj.id);
            if (!api) {
                api = jwplayer.api.selectPlayer(obj.id);
            }

            api.playerReady(obj);
        };

        jwplayer.api.selectPlayer = function (identifier) {
            var _container;

            if (!utils.exists(identifier)) {
                identifier = 0;
            }

            if (identifier.nodeType) {
                // Handle DOM Element
                _container = identifier;
            } else if (typeof identifier === 'string') {
                // Find container by ID
                _container = document.getElementById(identifier);
            }

            if (_container) {
                var foundPlayer = jwplayer.api.playerById(_container.id);
                if (foundPlayer) {
                    return foundPlayer;
                } else {
                    return (new jwplayer.api(_container));
                }
            } else if (typeof identifier === 'number') {
                return _players[identifier];
            }

            return null;
        };


        jwplayer.api.playerById = function (id) {
            for (var p = 0; p < _players.length; p++) {
                if (_players[p].id === id) {
                    return _players[p];
                }
            }

            return null;
        };


        jwplayer.api.addPlayer = function (player) {
            for (var p = 0; p < _players.length; p++) {
                if (_players[p] === player) {
                    return player; // Player is already in the list;
                }
            }

            _uniqueIndex++;
            player.uniqueId = _uniqueIndex;
            _players.push(player);
            return player;
        };


        // Destroys all players bound to a specific dom element by ID
        jwplayer.api.destroyPlayer = function (id) {
            // Get all players with matching id
            var players = _.where(_players, { id: id });

            // Call remove on every player in the array
            _.each(players, _.partial(_.result, _, 'remove'));
        };


    })(window.jwplayer);
    (function (jwplayer) {
        var events = jwplayer.events,
            utils = jwplayer.utils,
            states = events.state;

        jwplayer.api.instream = function (_api, _player) {

            var _item,
                _options,
                _listeners = {},
                _stateListeners = {},
                _this = this;

            function _addInternalListener(id, type) {
                _player.jwInstreamAddEventListener(type,
                        'function(dat) { jwplayer("' + id + '").dispatchInstreamEvent("' + type + '", dat); }');
            }

            function _eventListener(type, callback) {
                if (!_listeners[type]) {
                    _listeners[type] = [];
                    _addInternalListener(_api.id, type);
                }
                _listeners[type].push(callback);
                return this;
            }

            function _stateListener(state, callback) {
                if (!_stateListeners[state]) {
                    _stateListeners[state] = [];
                    _eventListener(events.JWPLAYER_PLAYER_STATE, _stateCallback(state));
                }
                _stateListeners[state].push(callback);
                return this;
            }

            function _stateCallback(state) {
                return function (args) {
                    var newstate = args.newstate,
                        oldstate = args.oldstate;
                    if (newstate === state) {
                        var callbacks = _stateListeners[newstate];
                        if (callbacks) {
                            for (var c = 0; c < callbacks.length; c++) {
                                var fn = callbacks[c];
                                if (typeof fn === 'function') {
                                    fn.call(this, {
                                        oldstate: oldstate,
                                        newstate: newstate,
                                        type: args.type
                                    });
                                }
                            }
                        }
                    }
                };
            }

            _this.type = 'instream';

            _this.init = function () {
                _api.callInternal('jwInitInstream');
                return _this;
            };
            _this.loadItem = function (item, options) {
                _item = item;
                _options = options || {};
                if (utils.typeOf(item) === 'array') {
                    _api.callInternal('jwLoadArrayInstream', _item, _options);
                } else {
                    _api.callInternal('jwLoadItemInstream', _item, _options);
                }
            };

            _this.removeEvents = function () {
                _listeners = _stateListeners = {};
            };

            _this.removeEventListener = function (type, callback) {
                var listeners = _listeners[type];
                if (listeners) {
                    for (var l = listeners.length; l--;) {
                        if (listeners[l] === callback) {
                            listeners.splice(l, 1);
                        }
                    }
                }
            };

            _this.dispatchEvent = function (type, calledArguments) {
                var listeners = _listeners[type];
                if (listeners) {
                    listeners = listeners.slice(0); //copy array
                    var args = utils.translateEventResponse(type, calledArguments[1]);
                    for (var l = 0; l < listeners.length; l++) {
                        var fn = listeners[l];
                        if (typeof fn === 'function') {
                            fn.call(this, args);
                        }
                    }
                }
            };
            _this.onError = function (callback) {
                return _eventListener(events.JWPLAYER_ERROR, callback);
            };
            _this.onMediaError = function (callback) {
                return _eventListener(events.JWPLAYER_MEDIA_ERROR, callback);
            };
            _this.onFullscreen = function (callback) {
                return _eventListener(events.JWPLAYER_FULLSCREEN, callback);
            };
            _this.onMeta = function (callback) {
                return _eventListener(events.JWPLAYER_MEDIA_META, callback);
            };
            _this.onMute = function (callback) {
                return _eventListener(events.JWPLAYER_MEDIA_MUTE, callback);
            };
            _this.onComplete = function (callback) {
                return _eventListener(events.JWPLAYER_MEDIA_COMPLETE, callback);
            };
            // _this.onSeek = function(callback) {
            //    return _eventListener(events.JWPLAYER_MEDIA_SEEK, callback);
            // };

            _this.onPlaylistComplete = function (callback) {
                return _eventListener(events.JWPLAYER_PLAYLIST_COMPLETE, callback);
            };

            _this.onPlaylistItem = function (callback) {
                return _eventListener(events.JWPLAYER_PLAYLIST_ITEM, callback);
            };

            _this.onTime = function (callback) {
                return _eventListener(events.JWPLAYER_MEDIA_TIME, callback);
            };
            // _this.onVolume = function(callback) {
            // return _eventListener(events.JWPLAYER_MEDIA_VOLUME, callback);
            // };
            // State events
            _this.onBuffer = function (callback) {
                return _stateListener(states.BUFFERING, callback);
            };
            _this.onPause = function (callback) {
                return _stateListener(states.PAUSED, callback);
            };
            _this.onPlay = function (callback) {
                return _stateListener(states.PLAYING, callback);
            };
            _this.onIdle = function (callback) {
                return _stateListener(states.IDLE, callback);
            };
            // Instream events
            _this.onClick = function (callback) {
                return _eventListener(events.JWPLAYER_INSTREAM_CLICK, callback);
            };
            _this.onInstreamDestroyed = function (callback) {
                return _eventListener(events.JWPLAYER_INSTREAM_DESTROYED, callback);
            };
            _this.onAdSkipped = function (callback) {
                return _eventListener(events.JWPLAYER_AD_SKIPPED, callback);
            };
            _this.play = function (state) {
                _player.jwInstreamPlay(state);
            };
            _this.pause = function (state) {
                _player.jwInstreamPause(state);
            };
            _this.hide = function () {
                _api.callInternal('jwInstreamHide');
            };
            _this.destroy = function () {
                _this.removeEvents();
                _api.callInternal('jwInstreamDestroy');
            };
            _this.setText = function (text) {
                _player.jwInstreamSetText(text ? text : '');
            };
            _this.getState = function () {
                return _player.jwInstreamState();
            };
            _this.setClick = function (url) {
                //only present in flashMode
                if (_player.jwInstreamClick) {
                    _player.jwInstreamClick(url);
                }
            };
        };

    })(jwplayer);
    /**
     * JW Player Source Endcap
     *
     * This will appear at the end of the JW Player source
     *
     * @version 6.0
     */

}
