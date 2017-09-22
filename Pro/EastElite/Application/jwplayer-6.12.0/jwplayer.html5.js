/**
 * jwplayer.html5 namespace
 *
 * @author pablo
 * @version 6.0
 */
(function(jwplayer) {
    jwplayer.html5 = {};
    jwplayer.html5.version = '6.12.0';

    // These 'reset' styles must be included before any others
    var _css = jwplayer.utils.css;
    var JW_CLASS = '.jwplayer ';

    var helperString = [JW_CLASS, 'div', 'span', 'a', 'img', 'ul', 'li', 'video'].join(', ' + JW_CLASS);
    _css(helperString + ', .jwclick', {
        margin: 0,
        padding: 0,
        border: 0,
        color: '#000000',
        'font-size': '100%',
        font: 'inherit',
        'vertical-align': 'baseline',
        'background-color': 'transparent',
        'text-align': 'left',
        'direction': 'ltr',
        'line-height': 20,
        '-webkit-tap-highlight-color': 'rgba(255, 255, 255, 0)'
    });

    // Reset box-sizing to default for player and all sub-elements
    //  Note: If we use pseudo elements we will need to add *:before and *:after
    _css(JW_CLASS + ',' + JW_CLASS + '*', { 'box-sizing': 'content-box'});
    // Browsers use border-box as a the default box-sizing for many form elements
    _css(JW_CLASS + '* button,' + JW_CLASS + '* input,' + JW_CLASS + '* select,' + JW_CLASS + '* textarea',
        { 'box-sizing': 'border-box'});


    _css(JW_CLASS + 'ul', {
        'list-style': 'none'
    });


    // These rules allow click and hover events to reach the provider, instead
    //  of being blocked by the controller element
    //  ** Note : pointer-events will not work on IE < 11
    _css('.jwplayer .jwcontrols', {
        'pointer-events': 'none'
    });
    _css('.jwplayer.jw-user-inactive .jwcontrols', {
        'pointer-events': 'all'
    });
    var acceptClicks = [
        '.jwplayer .jwcontrols .jwdockbuttons',
        '.jwplayer .jwcontrols .jwcontrolbar',
        '.jwplayer .jwcontrols .jwskip',
        '.jwplayer .jwcontrols .jwdisplayIcon', // play and replay button
        '.jwplayer .jwcontrols .jwpreview', // poster image
        '.jwplayer .jwcontrols .jwlogo'
    ];
    _css(acceptClicks.join(', '), {
        'pointer-events' : 'all'
    });

})(jwplayer);
/**
 * HTML5-only utilities for the JW Player.
 *
 * @author pablo
 * @version 6.0
 */
(function(utils) {
    var DOCUMENT = document;

    /**
     * Cleans up a css dimension (e.g. '420px') and returns an integer.
     */
    utils.parseDimension = function(dimension) {
        if (typeof dimension === 'string') {
            if (dimension === '') {
                return 0;
            } else if (dimension.lastIndexOf('%') > -1) {
                return dimension;
            }
            return parseInt(dimension.replace('px', ''), 10);
        }
        return dimension;
    };

    /** Format the elapsed / remaining text. **/
    utils.timeFormat = function(sec) {
        if (sec > 0) {
            var hrs = Math.floor(sec / 3600),
                mins = Math.floor((sec - hrs * 3600) / 60),
                secs = Math.floor(sec % 60);

            return (hrs ? hrs + ':' : '') + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        } else {
            return '00:00';
        }
    };

    utils.bounds = function(element) {
        var bounds = {
            left: 0,
            right: 0,
            width: 0,
            height: 0,
            top: 0,
            bottom: 0
        };
        if (!element || !DOCUMENT.body.contains(element)) {
            return bounds;
        }
        if (element.getBoundingClientRect) {
            var rect = element.getBoundingClientRect(element),
                scrollOffsetY = window.pageYOffset,
                scrollOffsetX = window.pageXOffset;
            if (!rect.width && !rect.height && !rect.left && !rect.top) {
                //element is not visible / no layout
                return bounds;
            }
            bounds.left = rect.left + scrollOffsetX;
            bounds.right = rect.right + scrollOffsetX;
            bounds.top = rect.top + scrollOffsetY;
            bounds.bottom = rect.bottom + scrollOffsetY;
            bounds.width = rect.right - rect.left;
            bounds.height = rect.bottom - rect.top;
        } else {
            /*jshint -W084 */ // For the while loop assignment
            bounds.width = element.offsetWidth | 0;
            bounds.height = element.offsetHeight | 0;
            do {
                bounds.left += element.offsetLeft | 0;
                bounds.top += element.offsetTop | 0;
            } while (element = element.offsetParent);
            bounds.right = bounds.left + bounds.width;
            bounds.bottom = bounds.top + bounds.height;
        }
        return bounds;
    };

    utils.empty = function(element) {
        if (!element) {
            return;
        }
        while (element.childElementCount > 0) {
            element.removeChild(element.children[0]);
        }
    };

})(jwplayer.utils);
(function(utils) {
    /*jshint maxparams:6*/

    /** Stretching options **/
    var _stretching = utils.stretching = {
        NONE: 'none',
        FILL: 'fill',
        UNIFORM: 'uniform',
        EXACTFIT: 'exactfit'
    };

    utils.scale = function(domelement, xscale, yscale, xoffset, yoffset) {
        var value = '';

        // Set defaults
        xscale = xscale || 1;
        yscale = yscale || 1;
        xoffset = xoffset | 0;
        yoffset = yoffset | 0;

        if (xscale !== 1 || yscale !== 1) {
            value = 'scale(' + xscale + ', ' + yscale + ')';
        }
        if (xoffset || yoffset) {
            if (value) {
                value += ' ';
            }
            value = 'translate(' + xoffset + 'px, ' + yoffset + 'px)';
        }
        utils.transform(domelement, value);
    };

    /**
     * Stretches domelement based on stretching. parentWidth, parentHeight,
     * elementWidth, and elementHeight are required as the elements dimensions
     * change as a result of the stretching. Hence, the original dimensions must
     * always be supplied.
     *
     * @param {String}
     *            stretching
     * @param {DOMElement}
     *            domelement
     * @param {Number}
     *            parentWidth
     * @param {Number}
     *            parentHeight
     * @param {Number}
     *            elementWidth
     * @param {Number}
     *            elementHeight
     */
    utils.stretch = function(stretching, domelement, parentWidth, parentHeight, elementWidth, elementHeight) {
        if (!domelement) {
            return false;
        }
        if (!parentWidth || !parentHeight || !elementWidth || !elementHeight) {
            return false;
        }
        stretching = stretching || _stretching.UNIFORM;

        var xscale = Math.ceil(parentWidth / 2) * 2 / elementWidth,
            yscale = Math.ceil(parentHeight / 2) * 2 / elementHeight,
            video = (domelement.tagName.toLowerCase() === 'video'),
            scale = false,
            stretchClass = 'jw' + stretching.toLowerCase();

        switch (stretching.toLowerCase()) {
            case _stretching.FILL:
                if (xscale > yscale) {
                    yscale = xscale;
                } else {
                    xscale = yscale;
                }
                scale = true;
                break;
            case _stretching.NONE:
                xscale = yscale = 1;
                /* falls through */
            case _stretching.EXACTFIT:
                scale = true;
                break;
            case _stretching.UNIFORM:
                /* falls through */
            default:
                if (xscale > yscale) {
                    if (elementWidth * yscale / parentWidth > 0.95) {
                        scale = true;
                        stretchClass = 'jwexactfit';
                    } else {
                        elementWidth = elementWidth * yscale;
                        elementHeight = elementHeight * yscale;
                    }
                } else {
                    if (elementHeight * xscale / parentHeight > 0.95) {
                        scale = true;
                        stretchClass = 'jwexactfit';
                    } else {
                        elementWidth = elementWidth * xscale;
                        elementHeight = elementHeight * xscale;
                    }
                }
                if (scale) {
                    xscale = Math.ceil(parentWidth / 2) * 2 / elementWidth;
                    yscale = Math.ceil(parentHeight / 2) * 2 / elementHeight;
                }
        }

        if (video) {
            var style = {
                left: '',
                right: '',
                width: '',
                height: ''
            };
            if (scale) {
                if (parentWidth < elementWidth) {
                    style.left =
                        style.right = Math.ceil((parentWidth - elementWidth) / 2);
                }
                if (parentHeight < elementHeight) {
                    style.top =
                        style.bottom = Math.ceil((parentHeight - elementHeight) / 2);
                }
                style.width = elementWidth;
                style.height = elementHeight;
                utils.scale(domelement, xscale, yscale, 0, 0);
            } else {
                scale = false;
                utils.transform(domelement);
            }
            utils.css.style(domelement, style);
        } else {
            domelement.className = domelement.className.replace(/\s*jw(none|exactfit|uniform|fill)/g, '') +
                ' ' + stretchClass;
        }
        return scale;
    };

})(jwplayer.utils);
(function(parsers) {

    /** Component that loads and parses an DFXP file. **/
    parsers.dfxp = function() {

        var _seconds = jwplayer.utils.seconds;

        this.parse = function(data) {
            var _captions = [{
                begin: 0,
                text: ''
            }];
            data = data.replace(/^\s+/, '').replace(/\s+$/, '');
            var list = data.split('</p>');
            var list2 = data.split('</tt:p>');
            var newlist = [];
            var i;
            for (i = 0; i < list.length; i++) {
                if (list[i].indexOf('<p') >= 0) {
                    list[i] = list[i].substr(list[i].indexOf('<p') + 2).replace(/^\s+/, '').replace(/\s+$/, '');
                    newlist.push(list[i]);
                }
            }
            for (i = 0; i < list2.length; i++) {
                if (list2[i].indexOf('<tt:p') >= 0) {
                    list2[i] = list2[i].substr(list2[i].indexOf('<tt:p') + 5).replace(/^\s+/, '').replace(/\s+$/, '');
                    newlist.push(list2[i]);
                }
            }
            list = newlist;

            for (i = 0; i < list.length; i++) {
                var entry = _entry(list[i]);
                if (entry.text) {
                    _captions.push(entry);
                    // Insert empty caption at the end.
                    if (entry.end) {
                        _captions.push({
                            begin: entry.end,
                            text: ''
                        });
                        delete entry.end;
                    }
                }
            }
            if (_captions.length > 1) {
                return _captions;
            } else {
                throw {
                    message: 'Invalid DFXP file:'
                };
            }
        };


        /** Parse a single captions entry. **/
        function _entry(data) {
            var entry = {};
            try {
                var idx = data.indexOf('begin=\"');
                data = data.substr(idx + 7);
                idx = data.indexOf('\" end=\"');
                entry.begin = _seconds(data.substr(0, idx));
                data = data.substr(idx + 7);
                idx = data.indexOf('\"');
                entry.end = _seconds(data.substr(0, idx));
                idx = data.indexOf('\">');
                data = data.substr(idx + 2);
                entry.text = data;
            } catch (error) {}
            return entry;
        }

    };


})(jwplayer.parsers);
(function(parsers) {


    /** Component that loads and parses an SRT file. **/
    parsers.srt = function() {


        /** XMLHTTP Object. **/
        var _utils = jwplayer.utils,
            _seconds = _utils.seconds;

        this.parse = function(data, mergeBeginEnd) {
            // Trim whitespace and split the list by returns.
            var _captions = mergeBeginEnd ? [] : [{
                begin: 0,
                text: ''
            }];
            data = _utils.trim(data);
            var list = data.split('\r\n\r\n');
            if (list.length === 1) {
                list = data.split('\n\n');
            }
            for (var i = 0; i < list.length; i++) {
                if (list[i] === 'WEBVTT') {
                    continue;
                }
                // Parse each entry
                var entry = _entry(list[i]);
                if (entry.text) {
                    _captions.push(entry);
                    // Insert empty caption at the end.
                    if (entry.end && !mergeBeginEnd) {
                        _captions.push({
                            begin: entry.end,
                            text: ''
                        });
                        delete entry.end;
                    }
                }
            }
            if (_captions.length > 1) {
                return _captions;
            } else {
                throw {
                    message: 'Invalid SRT file'
                };
            }
        };


        /** Parse a single captions entry. **/
        function _entry(data) {
            var entry = {};
            var array = data.split('\r\n');
            if (array.length === 1) {
                array = data.split('\n');
            }
            try {
                // Second line contains the start and end.
                var idx = 1;
                if (array[0].indexOf(' --> ') > 0) {
                    idx = 0;
                }
                var index = array[idx].indexOf(' --> ');
                if (index > 0) {
                    entry.begin = _seconds(array[idx].substr(0, index));
                    entry.end = _seconds(array[idx].substr(index + 5));
                }
                // Third line starts the text.
                if (array[idx + 1]) {
                    entry.text = array[idx + 1];
                    // Arbitrary number of additional lines.
                    for (var i = idx + 2; i < array.length; i++) {
                        entry.text += '<br/>' + array[i];
                    }
                }
            } catch (error) {}
            return entry;
        }

    };


})(jwplayer.parsers);
(function(jwplayer) {

    var noop = jwplayer.utils.noop,
        _ = jwplayer._,
        events = jwplayer.events,
        returnFalse = _.constant(false);

    var defaultProvider = {
        // This function is required to determine if a provider can work on a given source
        supports : returnFalse,

        // Basic playback features
        play : noop,
        load : noop,
        stop : noop,
        volume : noop,
        mute : noop,
        seek : noop,
        seekDrag : noop, // only for html5 ?
        resize : noop,
        remove : noop,  // removes from page
        destroy : noop, // frees memory

        setVisibility : noop,
        setFullscreen : returnFalse,
        getFullscreen : noop,

        // If setContainer has been set, this returns the element.
        //  It's value is used to determine if we should remove the <video> element when setting a new provider.
        getContainer : noop,

        // Sets the parent element, causing provider to append <video> into it
        setContainer : returnFalse,

        isAudioFile : returnFalse,
        supportsFullscreen : returnFalse,

        getQualityLevels : noop,
        getCurrentQuality : noop,
        setCurrentQuality : noop,
        
        getAudioTracks : noop,
        getCurrentAudioTrack : noop,
        setCurrentAudioTrack : noop,

        // TODO :: The following are targets for removal after refactoring
        checkComplete : noop,
        setControls : noop,
        attachMedia : noop,
        detachMedia : noop,

        setState: function(state) {
            if (state === this.state) {
                return;
            }

            var oldState = this.state || events.state.IDLE;
            this.state = state;

            this.sendEvent(events.JWPLAYER_PLAYER_STATE, {
                oldstate: oldState,
                newstate: state
            });
        }
    };


    // Make available to other providers for extending
    jwplayer.html5.DefaultProvider  = defaultProvider;

})(jwplayer);
(function(jwplayer) {

    function chooseProvider(source) {
        if (jwplayer._.isObject(source) && jwplayer.html5.YoutubeProvider.supports(source)) {
            return jwplayer.html5.YoutubeProvider;
        }
        return jwplayer.html5.VideoProvider;
    }

    jwplayer.html5.chooseProvider = chooseProvider;

})(jwplayer);(function(jwplayer) {

    var utils = jwplayer.utils,
        _ = jwplayer._,
        events = jwplayer.events,
        states = events.state,
        clearInterval = window.clearInterval,
        DefaultProvider = jwplayer.html5.DefaultProvider,
        _isIE = utils.isMSIE(),
        _isMobile = utils.isMobile(),
        _isSafari = utils.isSafari(),
        _isAndroid = utils.isAndroidNative(),
        _isIOS7 = utils.isIOS(7);


    function _setupListeners(eventsHash, videoTag) {
        utils.foreach(eventsHash, function(evt, evtCallback) {
            videoTag.addEventListener(evt, evtCallback, false);
        });
    }

    function _removeListeners(eventsHash, videoTag) {
        utils.foreach(eventsHash, function(evt, evtCallback) {
            videoTag.removeEventListener(evt, evtCallback, false);
        });
    }

    function _round(number) {
        return Math.floor(number*10) / 10;
    }

    function VideoProvider(_playerId) {

        // Current media state
        this.state = states.IDLE;

        var _dispatcher = new jwplayer.events.eventdispatcher('provider.' + this.name);
        utils.extend(this, _dispatcher);

        var _this = this,
            _mediaEvents = {
                abort: _generalHandler,
                canplay: _canPlayHandler,
                canplaythrough: _generalHandler,
                click : _onClickHandler,
                durationchange: _durationUpdateHandler,
                emptied: _generalHandler,
                ended: _endedHandler,
                error: _errorHandler,
                loadeddata: _generalHandler,
                loadedmetadata: _canPlayHandler,
                loadstart: _generalHandler,
                pause: _playHandler,
                play: _playHandler,
                playing: _playHandler,
                progress: _progressHandler,
                ratechange: _generalHandler,
                readystatechange: _generalHandler,
                seeked: _sendSeekEvent,
                seeking: _isIE ? _bufferStateHandler : _generalHandler,
                stalled: _generalHandler,
                suspend: _generalHandler,
                timeupdate: _timeUpdateHandler,
                volumechange: _volumeHandler,
                waiting: _bufferStateHandler,
                webkitbeginfullscreen: _fullscreenBeginHandler,
                webkitendfullscreen: _fullscreenEndHandler
            },
            // DOM container
            _container,
            // Currently playing source
            _source,
            // Current duration
            _duration,
            // Current position
            _position,
            // Whether seeking is ready yet
            _canSeek = false,
            // Whether we have sent out the BUFFER_FULL event
            _bufferFull,
            // If we should seek on canplay
            _delayedSeek = 0,
            // If we're currently dragging the seek bar
            _dragging = false,
            // Save the volume state before muting
            _lastVolume,
            // Using setInterval to check buffered ranges
            _bufferInterval = -1,
            // Last sent buffer amount
            _bufferPercent = -1,
            // Whether or not we're listening to video tag events
            _attached = false,
            // Quality levels
            _levels,
            // Current quality level index
            _currentQuality = -1,

            // post roll support
            _beforecompleted = false,

            _fullscreenState = false;

        // Overwrite the event dispatchers to block on certain occasions
        this.sendEvent = function() {
            if (!_attached) { return; }

            _dispatcher.sendEvent.apply(this, arguments);
        };


        // Find video tag, or create it if it doesn't exist
        var element = document.getElementById(_playerId);
        var _videotag = element.querySelector('video');
        _videotag = _videotag || document.createElement('video');

        _setupListeners(_mediaEvents, _videotag);

        // Workaround for a Safari bug where video disappears on switch to fullscreen
        if (!_isIOS7) {
            _videotag.controls = true;
            _videotag.controls = false;
        }

        // Enable AirPlay
        _videotag.setAttribute('x-webkit-airplay', 'allow');
        _videotag.setAttribute('webkit-playsinline', '');


        _attached = true;


        function _generalHandler() {
            //if (evt) {
            //    utils.log('%s %o (%s,%s)', evt.type, evt);
            //}
        }

        function _onClickHandler() {
            _this.sendEvent(events.JWPLAYER_PROVIDER_CLICK);
        }

        function _durationUpdateHandler(evt) {
            _generalHandler(evt);
            if (!_attached) { return; }
            var newDuration = _round(_videotag.duration);
            if (_duration !== newDuration) {
                _duration = newDuration;
            }
            if (_isAndroid && _delayedSeek > 0 && newDuration > _delayedSeek) {
                _this.seek(_delayedSeek);
            }
            _timeUpdateHandler();
        }

        function _timeUpdateHandler(evt) {
            _generalHandler(evt);
            _progressHandler(evt);

            if (!_attached) { return; }
            if (_this.state === states.PLAYING && !_dragging) {
                _position = _round(_videotag.currentTime);
                // do not allow _durationUpdateHandler to update _canSeek before _canPlayHandler does
                if (evt) {
                    _canSeek = true;
                }
                _this.sendEvent(events.JWPLAYER_MEDIA_TIME, {
                    position: _position,
                    duration: _duration
                });
                // Working around a Galaxy Tab bug; otherwise _duration should be > 0
                //              if (_position >= _duration && _duration > 3 && !utils.isAndroid(2.3)) {
                //                  _complete();
                //              }
            }
        }

        function sendMetaEvent() {
            _this.sendEvent(events.JWPLAYER_MEDIA_META, {
                duration: _videotag.duration,
                height: _videotag.videoHeight,
                width: _videotag.videoWidth
            });
        }

        function _canPlayHandler(evt) {
            _generalHandler(evt);

            if (!_attached) {
                return;
            }

            if (!_canSeek) {
                _canSeek = true;
                _sendBufferFull();
            }
            if (evt.type === 'loadedmetadata') {
                //fixes Chrome bug where it doesn't like being muted before video is loaded
                if (_videotag.muted) {
                    _videotag.muted = false;
                    _videotag.muted = true;
                }
                sendMetaEvent();
            }
        }

        function _progressHandler(evt) {
            _generalHandler(evt);
            if (_canSeek && _delayedSeek > 0 && !_isAndroid) {
                // Need to set a brief timeout before executing delayed seek; IE9 stalls otherwise.
                if (_isIE) {
                    setTimeout(function() {
                        if (_delayedSeek > 0) {
                            _this.seek(_delayedSeek);
                        }
                    }, 200);
                } else {
                    // Otherwise call it immediately
                    _this.seek(_delayedSeek);
                }
            }
        }

        function _sendBufferFull() {
            if (!_bufferFull) {
                _bufferFull = true;
                _this.sendEvent(events.JWPLAYER_MEDIA_BUFFER_FULL);
            }
        }

        function _playHandler(evt) {
            _generalHandler(evt);
            if (!_attached || _dragging) {
                return;
            }

            if (_videotag.paused) {
                if (_videotag.currentTime === _videotag.duration && _videotag.duration > 3) {
                    // Needed as of Chrome 20
                    //_complete();
                } else {
                    _this.pause();
                }
            } else {
                if (utils.isFF() && evt.type === 'play' && _this.state === states.BUFFERING) {
                    // In FF, we get an extra "play" event on startup - we need to wait for "playing",
                    // which is also handled by this function
                    return;
                } else {
                    _this.setState(states.PLAYING);
                }
            }
        }

        function _bufferStateHandler(evt) {
            _generalHandler(evt);
            if (!_attached) {
                return;
            }
            if (!_dragging) {
                _this.setState(states.BUFFERING);
            }
        }

        function _errorHandler() { //evt) {
            if (!_attached) {
                return;
            }
            utils.log('Error playing media: %o %s', _videotag.error, _videotag.src || _source.file);
            _this.sendEvent(events.JWPLAYER_MEDIA_ERROR, {
                message: 'Error loading media: File could not be played'
            });
            _this.setState(states.IDLE);
        }

        function _getPublicLevels(levels) {
            var publicLevels;
            if (utils.typeOf(levels) === 'array' && levels.length > 0) {
                publicLevels = [];
                for (var i = 0; i < levels.length; i++) {
                    var level = levels[i],
                        publicLevel = {};
                    publicLevel.label = _levelLabel(level) ? _levelLabel(level) : i;
                    publicLevels[i] = publicLevel;
                }
            }
            return publicLevels;
        }

        function _sendLevels(levels) {
            var publicLevels = _getPublicLevels(levels);
            if (publicLevels) {
                //_sendEvent?
                _this.sendEvent(events.JWPLAYER_MEDIA_LEVELS, {
                    levels: publicLevels,
                    currentQuality: _currentQuality
                });
            }
        }

        function _levelLabel(level) {
            if (level.label) {
                return level.label;
            }

            return 0;
        }

        function _pickInitialQuality() {
            if (_currentQuality < 0) {
                _currentQuality = 0;
            }
            if (_levels) {
                var cookies = utils.getCookies(),
                    label = cookies.qualityLabel;
                for (var i = 0; i < _levels.length; i++) {
                    if (_levels[i]['default']) {
                        _currentQuality = i;
                    }
                    if (label && _levels[i].label === label) {
                        _currentQuality = i;
                        break;
                    }
                }
            }

        }

        function _forceVideoLoad() {
            // These browsers will not replay videos without reloading them
            return (_isMobile || _isSafari);
        }

        function _completeLoad(startTime, duration) {

            _source = _levels[_currentQuality];

            clearInterval(_bufferInterval);
            _bufferInterval = setInterval(_sendBufferUpdate, 100);

            _delayedSeek = 0;

            var sourceChanged = (_videotag.src !== _source.file);
            if (sourceChanged || _forceVideoLoad()) {
                if (!_isMobile) {
                    // don't change state on mobile because a touch event may be required to start playback
                    _this.setState(states.BUFFERING);
                }
                _canSeek = false;
                _bufferFull = false;
                _duration = duration ? duration : -1;
                _videotag.src = _source.file;
                _videotag.load();
            } else {
                // Load event is from the same video as before
                if (startTime === 0) {
                    // restart video without dispatching seek event
                    _delayedSeek = -1;
                    _this.seek(startTime);
                }
                // meta event is usually triggered by load, and is needed for googima to work on replay
                sendMetaEvent();
                _videotag.play();
            }

            _position = _videotag.currentTime;

            if (_isMobile) {
                // results in html5.controller calling video.play()
                _sendBufferFull();
            }

            //in ios and fullscreen, set controls true, then when it goes to normal screen the controls don't show'
            if (utils.isIOS() && _this.getFullScreen()) {
                _videotag.controls = true;
            }

            if (startTime > 0) {
                _this.seek(startTime);
            }
        }

        this.stop = function() {
            if (!_attached) { return; }
            clearInterval(_bufferInterval);
            _videotag.removeAttribute('src');
            if (!_isIE) {
                _videotag.load();
            }
            _currentQuality = -1;
            this.setState(states.IDLE);
        };


        this.destroy = function() {
             _removeListeners(_mediaEvents, _videotag);

            this.remove();
        };

        this.load = function(item) {
            if (!_attached) {
                return;
            }

            _levels = item.sources;
            _pickInitialQuality();
            _sendLevels(_levels);

            _completeLoad(item.starttime || 0, item.duration);
        };

        this.play = function() {
            if (_attached && !_dragging) {
                _videotag.play();
            }
        };

        this.pause = function() {
            if (_attached) {
                _videotag.pause();
                this.setState(states.PAUSED);
            }
        };

        this.seekDrag = function(state) {
            if (!_attached) {
                return;
            }
            _dragging = state;
            if (state) {
                _videotag.pause();
            } else {
                _videotag.play();
            }
        };

        this.seek = function(seekPos) {
            if (!_attached) {
                return;
            }

            if (!_dragging && _delayedSeek === 0) {
                this.sendEvent(events.JWPLAYER_MEDIA_SEEK, {
                    position: _position,
                    offset: seekPos
                });
            }

            if (_canSeek) {
                _delayedSeek = 0;
                // handle readystate issue
                try {
                    _videotag.currentTime = seekPos;
                } catch (e) {
                    _delayedSeek = seekPos;
                }

            } else {
                _delayedSeek = seekPos;
            }

        };

        function _sendSeekEvent(evt) {
            _generalHandler(evt);
            if (!_dragging && _this.state !== states.PAUSED) {
                _this.setState(states.PLAYING);
            }
        }

        this.volume = function(vol) {
            if (utils.exists(vol)) {
                _videotag.volume = Math.min(Math.max(0, vol / 100), 1);
                _lastVolume = _videotag.volume * 100;
            }
        };

        function _volumeHandler() {
            _this.sendEvent(events.JWPLAYER_MEDIA_VOLUME, {
                volume: Math.round(_videotag.volume * 100)
            });
            _this.sendEvent(events.JWPLAYER_MEDIA_MUTE, {
                mute: _videotag.muted
            });
        }

        this.mute = function(state) {
            if (!utils.exists(state)) { state = !_videotag.muted; }

            if (state) {
                _lastVolume = _videotag.volume * 100;
                _videotag.muted = true;
            } else {
                this.volume(_lastVolume);
                _videotag.muted = false;
            }
        };

        /** Set the current player state * */
        this.setState = function(newstate) {
            // Handles a FF 3.5 issue
            if (newstate === states.PAUSED && this.state === states.IDLE) {
                return;
            }

            // Ignore state changes while dragging the seekbar
            if (_dragging) { return; }

            DefaultProvider.setState.apply(this, arguments);
        };

        function _sendBufferUpdate() {
            if (!_attached) { return; }
            var newBuffer = _getBuffer();

            if (newBuffer >= 1) {
                clearInterval(_bufferInterval);
            }

            if (newBuffer !== _bufferPercent) {
                _bufferPercent = newBuffer;
                _this.sendEvent(events.JWPLAYER_MEDIA_BUFFER, {
                    bufferPercent: Math.round(_bufferPercent * 100)
                });
            }
        }

        function _getBuffer() {
            var buffered = _videotag.buffered;
            if (!buffered || !_videotag.duration || buffered.length === 0) {
                return 0;
            }
            return buffered.end(buffered.length-1) / _videotag.duration;
        }

        function _endedHandler(evt) {
            _generalHandler(evt);
            if (_attached) {
                _complete();
            }
        }

        function _complete() {
            if (_this.state !== states.IDLE) {
                clearInterval(_bufferInterval);
                _currentQuality = -1;
                _beforecompleted = true;
                _this.sendEvent(events.JWPLAYER_MEDIA_BEFORECOMPLETE);


                if (_attached) {
                    _this.setState(states.IDLE);
                    _beforecompleted = false;
                    _this.sendEvent(events.JWPLAYER_MEDIA_COMPLETE);
                }
            }
        }

        function _fullscreenBeginHandler(e) {
            _fullscreenState = true;
            _sendFullscreen(e);
            // show controls on begin fullscreen so that they are disabled properly at end
            if (utils.isIOS()) {
                _videotag.controls = false;
            }
        }

        function _fullscreenEndHandler(e) {
            _fullscreenState = false;
            _sendFullscreen(e);
            if (utils.isIOS()) {
                _videotag.controls = false;
            }
        }

        function _sendFullscreen(e) {
            _this.sendEvent('fullscreenchange', {
                target: e.target,
                jwstate: _fullscreenState
            });
        }

        this.checkComplete = function() {
            return _beforecompleted;
        };

        /**
         * Return the video tag and stop listening to events
         */
        this.detachMedia = function() {
            clearInterval(_bufferInterval);
            _attached = false;
            // _canSeek = false;
            return _videotag;
        };

        /**
         * Begin listening to events again
         */
        this.attachMedia = function(seekable) {
            _attached = true;
            if (!seekable) {
                _canSeek = false;
            }

            // This is after a postroll completes
            if (_beforecompleted) {
                this.setState(states.IDLE);
                this.sendEvent(events.JWPLAYER_MEDIA_COMPLETE);
                _beforecompleted = false;
            }
        };

        this.setContainer = function(element) {
            _container = element;
            element.appendChild(_videotag);
        };

        this.getContainer = function() {
            return _container;
        };

        this.remove = function() {
            // stop video silently
            if (_videotag) {
                _videotag.removeAttribute('src');
                if (!_isIE) {
                    _videotag.load();
                }
            }

            clearInterval(_bufferInterval);

            _currentQuality = -1;

            // remove
            if (_container === _videotag.parentNode) {
                _container.removeChild(_videotag);
            }
        };

        this.setVisibility = function(state) {
            state = !!state;
            if (state || _isAndroid) {
                // Changing visibility to hidden on Android < 4.2 causes 
                // the pause event to be fired. This causes audio files to 
                // become unplayable. Hence the video tag is always kept 
                // visible on Android devices.
                utils.css.style(_container, {
                    visibility: 'visible',
                    opacity: 1
                });
            } else {
                utils.css.style(_container, {
                    visibility: '',
                    opacity: 0
                });
            }
        };

        this.resize = function(width, height, stretching) {
            return utils.stretch(stretching,
                _videotag,
                width, height,
                _videotag.videoWidth, _videotag.videoHeight);
        };

        this.setControls = function(state) {
            _videotag.controls = !!state;
        };

        this.supportsFullscreen = _.constant(true);

        this.setFullScreen = function(state) {
            state = !!state;

            // This implementation is for iOS and Android WebKit only
            // This won't get called if the player contain can go fullscreen
            if (state) {
                try {
                    var enterFullscreen =
                        _videotag.webkitEnterFullscreen ||
                        _videotag.webkitEnterFullScreen;
                    if (enterFullscreen) {
                        enterFullscreen.apply(_videotag);
                    }
                } catch (e) {
                    //object can't go fullscreen
                    return false;
                }
                return _this.getFullScreen();

            } else {
                var exitFullscreen =
                    _videotag.webkitExitFullscreen ||
                    _videotag.webkitExitFullScreen;
                if (exitFullscreen) {
                    exitFullscreen.apply(_videotag);
                }
            }

            return state;
        };

        _this.getFullScreen = function() {
            return _fullscreenState || !!_videotag.webkitDisplayingFullscreen;
        };

        this.isAudioFile = function() {
            if (!_levels) {
                return false;
            }
            var type = _levels[0].type;
            return (type === 'oga' || type === 'aac' || type === 'mp3' || type === 'vorbis');
        };

        this.setCurrentQuality = function(quality) {
            if (_currentQuality === quality) {
                return;
            }
            quality = parseInt(quality, 10);
            if (quality >= 0) {
                if (_levels && _levels.length > quality) {
                    _currentQuality = quality;
                    utils.saveCookie('qualityLabel', _levels[quality].label);
                    this.sendEvent(events.JWPLAYER_MEDIA_LEVEL_CHANGED, {
                        currentQuality: quality,
                        levels: _getPublicLevels(_levels)
                    });
                    var time = _round(_videotag.currentTime);
                    var duration = _round(_videotag.duration);
                    if (duration <= 0) {
                        duration = _duration;
                    }
                    _completeLoad(time, duration);
                }
            }
        };

        this.getCurrentQuality = function() {
            return _currentQuality;
        };

        this.getQualityLevels = function() {
            return _getPublicLevels(_levels);
        };

    }

    // Register provider
    var F = function(){};
    F.prototype = DefaultProvider;
    VideoProvider.prototype = new F();
    VideoProvider.supports = _.constant(true);

    jwplayer.html5.VideoProvider = VideoProvider;

})(jwplayer);
(function(jwplayer) {

    var utils = jwplayer.utils,
        _ = jwplayer._,
        events = jwplayer.events,
        states = events.state,
        DefaultProvider = jwplayer.html5.DefaultProvider,
        _scriptLoader = new utils.scriptloader(window.location.protocol + '//www.youtube.com/iframe_api'),
        _isMobile = utils.isMobile();

    function YoutubeProvider(_playerId) {

        this.state = states.IDLE;

        var _this = utils.extend(this, new jwplayer.events.eventdispatcher('provider.' + this.name)),
            // Youtube API and Player Instance
            _youtubeAPI = window.YT,
            _youtubePlayer = null,
            // iFrame Container (this element will be replaced by iFrame element)
            _element = document.createElement('div'),
            // view container
            _container,
            // player state
            _bufferPercent = -1,
            // only add player ready listener once 
            _listeningForReady = false,
            // function to call once api and view are ready
            _youtubeEmbedReadyCallback = null,
            // function to call once _ytPlayer api is ready
            _youtubePlayerReadyCallback = null,
            // update timer
            _playingInterval = -1,
            // current Youtube state, tracked because state events fail to fire
            _youtubeState = -1,
            // this is where we keep track of the volume
            _lastVolume,
            // post roll support
            _beforecompleted = false,
            // user must click video to initiate playback, gets set to false once playback starts
            _requiresUserInteraction = _isMobile;

        this.setState = function(state) {
            clearInterval(_playingInterval);
            if (state !== states.IDLE) {
                // always run this interval when not idle because we can't trust events from iFrame
                _playingInterval = setInterval(_checkPlaybackHandler, 250);
                if (state === states.PLAYING) {
                    _resetViewForMobile();
                } else if (state === states.BUFFERING) {
                    _bufferUpdate();
                }
            }

            DefaultProvider.setState.apply(this, arguments);
        };

        // Load iFrame API
        if (!_youtubeAPI && _scriptLoader) {
            _scriptLoader.addEventListener(events.COMPLETE, _onLoadSuccess);
            _scriptLoader.addEventListener(events.ERROR, _onLoadError);
            _scriptLoader.load();
        }

        // setup container
        _element.id = _playerId + '_youtube';

        function _onLoadSuccess() {
            if (window.YT && window.YT.loaded) {
                _youtubeAPI = window.YT;
                _readyCheck();
            } else {
                // poll until Yo API is loaded
                setTimeout(_onLoadSuccess, 100);
            }
        }

        function _onLoadError() {
            _scriptLoader = null;
            // console.log('Error loading Youtube iFrame API: %o', event);
            // TODO: dispatch video error
        }

        function _getVideoLayer() {
            var videoLayer = _element && _element.parentNode;
            if (!videoLayer) {
                // if jwplayer DOM is not ready, do Youtube embed on jwplayer ready
                if (!_listeningForReady) {
                    jwplayer(_playerId).onReady(_readyCheck);
                    _listeningForReady = true;
                }
                return false;
            }
            return videoLayer;
        }

        function _readyCheck() {
            if (_youtubeAPI && _getVideoLayer()) {
                // if setItem cued up a video, this callback will handle it now
                if (_youtubeEmbedReadyCallback) {
                    _youtubeEmbedReadyCallback.apply(_this);
                }
            }
        }

        function _checkPlaybackHandler() {
            // return if player is not initialized and ready
            if (!_youtubePlayer || !_youtubePlayer.getPlayerState) {
                return;
            }
            // manually check for state changes since API fails to do so
            var youtubeState = _youtubePlayer.getPlayerState();
            if (youtubeState !== null &&
                youtubeState !== undefined &&
                youtubeState !== _youtubeState) {
                _onYoutubeStateChange({
                    data: youtubeState
                });
            }
            // handle time and buffer updates
            var youtubeStates = _youtubeAPI.PlayerState;
            if (youtubeState === youtubeStates.PLAYING) {
                _timeUpdateHandler();
            } else if (youtubeState === youtubeStates.BUFFERING) {
                _bufferUpdate();
            }
        }


        function _round(number) {
            return Math.round(number*10)/10;
        }
        function _timeUpdateHandler() {
            _bufferUpdate();
            _this.sendEvent(events.JWPLAYER_MEDIA_TIME, {
                position: _round(_youtubePlayer.getCurrentTime()),
                duration: _youtubePlayer.getDuration()
            });
        }

        function _bufferUpdate() {
            var bufferPercent = 0;
            if (_youtubePlayer && _youtubePlayer.getVideoLoadedFraction) {
                bufferPercent = Math.round(_youtubePlayer.getVideoLoadedFraction() * 100);
            }
            if (_bufferPercent !== bufferPercent) {
                _bufferPercent = bufferPercent;
                _this.sendEvent(events.JWPLAYER_MEDIA_BUFFER, {
                    bufferPercent: bufferPercent
                });
                //if (bufferPercent === 100) this.sendEvent(events.JWPLAYER_MEDIA_BUFFER_FULL);
            }
        }

        function _ended() {
            if (_this.state !== states.IDLE) {
                _beforecompleted = true;
                _this.sendEvent(events.JWPLAYER_MEDIA_BEFORECOMPLETE);
                _this.setState(states.IDLE);
                _beforecompleted = false;
                _this.sendEvent(events.JWPLAYER_MEDIA_COMPLETE);
            }
        }

        function _sendMetaEvent() {
            _this.sendEvent(events.JWPLAYER_MEDIA_META, {
                duration: _youtubePlayer.getDuration(),
                width: _element.clientWidth,
                height: _element.clientHeight
            });
        }

        // Returns a function that is the composition of a list of functions, each
        // consuming the return value of the function that follows.
        function _composeCallbacks() {
            var args = arguments;
            var start = args.length - 1;
            return function() {
                var i = start;
                var result = args[start].apply(this, arguments);
                while (i--) { result = args[i].call(this, result); }
                return result;
            };
        }

        function _embedYoutubePlayer(videoId, playerVars) {
            if (!videoId) {
                throw 'invalid Youtube ID';
            }

            var videoLayer = _element.parentNode;
            if (!videoLayer) {
                // setContainer() hasn't been run yet
                return;
            }

            var ytConfig = {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: utils.extend({
                    html5: 1,
                    autoplay: 0,
                    controls: 0,
                    showinfo: 0,
                    rel: 0,
                    modestbranding: 0,
                    playsinline: 1,
                    origin: location.protocol + '//' + location.hostname
                }, playerVars),
                events: {
                    onReady: _onYoutubePlayerReady,
                    onStateChange: _onYoutubeStateChange,
                    onPlaybackQualityChange: _onYoutubePlaybackQualityChange,
                    // onPlaybackRateChange: _onYoutubePlaybackRateChange,
                    onError: _onYoutubePlayerError
                }
            };

            // iFrame must be visible or it will not set up properly
            _this.setVisibility(true);

            _youtubePlayer = new _youtubeAPI.Player(_element, ytConfig);
            _element = _youtubePlayer.getIframe();

            _youtubeEmbedReadyCallback = null;

            _readyViewForMobile();

            _volumeHandler();
        }

        // Youtube Player Event Handlers
        function _onYoutubePlayerReady() {
            // If setItem was called before the player was ready, update the player now
            if (_youtubePlayerReadyCallback) {
                _youtubePlayerReadyCallback.apply(_this);
                _youtubePlayerReadyCallback = null;
            }
        }

        function _onYoutubeStateChange(event) {
            var youtubeStates = _youtubeAPI.PlayerState;
            _youtubeState = event.data;

            switch (_youtubeState) {

                case youtubeStates.UNSTARTED: // -1: //unstarted
                    return;

                case youtubeStates.ENDED: // 0: //ended (idle after playback)
                    _ended();
                    return;

                case youtubeStates.PLAYING: // 1: playing
                
                    //prevent duplicate captions when using JW Player captions and YT video has yt:cc=on
                    if (_.isFunction(_youtubePlayer.unloadModule)) {
                        _youtubePlayer.unloadModule('captions');
                    }

                    // playback has started so stop blocking api.play()
                    _requiresUserInteraction = false;

                    // sent meta size and duration
                    _sendMetaEvent();

                    // send levels when playback starts
                    _this.sendEvent(events.JWPLAYER_MEDIA_LEVELS, {
                        levels: _this.getQualityLevels(),
                        currentQuality: _this.getCurrentQuality()
                    });

                    _this.setState(states.PLAYING);
                    return;

                case youtubeStates.PAUSED: // 2: //paused
                    _this.setState(states.PAUSED);
                    return;

                case youtubeStates.BUFFERING: // 3: //buffering
                    _this.setState(states.BUFFERING);
                    return;

                case youtubeStates.CUED: // 5: //video cued (idle before playback)
                    _this.setState(states.IDLE);
                    return;
            }
        }

        function _onYoutubePlaybackQualityChange() {
            // This event is where the Youtube player and media is actually ready and can be played

            // make sure playback starts/resumes
            if (_youtubeState !== _youtubeAPI.PlayerState.ENDED) {
                _this.play();
            }

            _this.sendEvent(events.JWPLAYER_MEDIA_LEVEL_CHANGED, {
                currentQuality: _this.getCurrentQuality(),
                levels: _this.getQualityLevels()
            });
        }

        function _onYoutubePlayerError() {
            _this.sendEvent(events.JWPLAYER_MEDIA_ERROR, {
                message: 'Error loading YouTube: Video could not be played'
            });
        }

        function _readyViewForMobile() {
            if (_isMobile) {
                _this.setVisibility(true);
                // hide controls so user can click on iFrame
                utils.css('#' + _playerId + ' .jwcontrols', {
                    display: 'none'
                });
            }
        }

        function _resetViewForMobile() {
            utils.css('#' + _playerId + ' .jwcontrols', {
                display: ''
            });
        }

        // Internal operations

        function _stopVideo() {
            clearInterval(_playingInterval);
            if (_youtubePlayer && _youtubePlayer.stopVideo) {
                try {
                    _youtubePlayer.stopVideo();
                    _youtubePlayer.clearVideo();
                } catch (e) {
                    //console.error('Error stopping YT', e);
                }
            }
        }
        // Additional Provider Methods (not yet implemented in html5.video)

        this.init = function(item) {
            // For now, we want each youtube provider to delete and start from scratch
            //this.destroy();

            // load item on embed for mobile touch to start
            _setItem(item);
        };

        this.destroy = function() {
            this.remove();

            _container =
                _element =
                _youtubeAPI =
                _this = null;
        };


        // Video Provider API
        this.load = function(item) {
            this.setState(states.BUFFERING);

            _setItem(item);
            // start playback if api is ready
            _this.play();
        };

        function _setItem(item) {
            _youtubePlayerReadyCallback = null;
            var url = item.sources[0].file;
            var videoId = utils.youTubeID(url);

            if (!item.image) {
                item.image = '//i.ytimg.com/vi/' + videoId + '/0.jpg';
            }

            _this.setVisibility(true);

            if (!_youtubeAPI || !_youtubePlayer) {
                // wait for API to be present and jwplayer DOM to be instantiated
                _youtubeEmbedReadyCallback = function() {
                    _embedYoutubePlayer(videoId);
                };
                _readyCheck();
                return;
            }

            if (!_youtubePlayer.getPlayerState) {
                var onStart = function() {
                    _volumeHandler();
                    _this.load(item);
                };
                if (_youtubePlayerReadyCallback) {
                    _youtubePlayerReadyCallback = _composeCallbacks(onStart, _youtubePlayerReadyCallback);
                } else {
                    _youtubePlayerReadyCallback = onStart;
                }
                return;
            }

            var currentVideoId = _youtubePlayer.getVideoData().video_id;

            if (currentVideoId !== videoId) {
                // An exception is thrown by the iframe_api - but the call works
                // it's trying to access an element of the controls which is not present
                // because we disabled control in the setup
                if (_requiresUserInteraction) {
                    _stopVideo();
                    _youtubePlayer.cueVideoById(videoId);
                } else {
                    _youtubePlayer.loadVideoById(videoId);
                }

                // if player is unstarted, ready for mobile
                var youtubeState = _youtubePlayer.getPlayerState();
                var youtubeStates = _youtubeAPI.PlayerState;
                if (youtubeState === youtubeStates.UNSTARTED || youtubeState === youtubeStates.CUED) {
                    _readyViewForMobile();
                }
            } else {
                // replay current video
                if (_youtubePlayer.getCurrentTime() > 0) {
                    _youtubePlayer.seekTo(0);
                }
                _sendMetaEvent();
            }
        }


        this.stop = function() {
            _stopVideo();
            this.setState(states.IDLE);
        };

        this.play = function() {
            if (_requiresUserInteraction) {
                return;
            }
            if (_youtubePlayer && _youtubePlayer.playVideo) {
                _youtubePlayer.playVideo();
            } else {    // If the _youtubePlayer isn't setup, then play when we're ready
                if (_youtubePlayerReadyCallback) {
                    _youtubePlayerReadyCallback = _composeCallbacks(this.play, _youtubePlayerReadyCallback);
                } else {
                    _youtubePlayerReadyCallback = this.play;
                }
            }
        };

        this.pause = function() {
            if (_requiresUserInteraction) {
                return;
            }
            if (_youtubePlayer.pauseVideo) {
                _youtubePlayer.pauseVideo();
            }
        };

        this.seek = function(position) {
            if (_requiresUserInteraction) {
                return;
            }
            if (_youtubePlayer.seekTo) {
                _youtubePlayer.seekTo(position);
            }
        };

        this.volume = function(volume) {
            if (!_youtubePlayer || !_youtubePlayer.getVolume) {
                return;
            }
            if (utils.exists(volume)) {
                _lastVolume = Math.min(Math.max(0, volume), 100);
                _youtubePlayer.setVolume(_lastVolume);
            }
        };

        function _volumeHandler() {
            if (!_youtubePlayer || !_youtubePlayer.getVolume) {
                return;
            }
            _this.sendEvent(events.JWPLAYER_MEDIA_VOLUME, {
                volume: Math.round(_youtubePlayer.getVolume())
            });
            _this.sendEvent(events.JWPLAYER_MEDIA_MUTE, {
                mute: _youtubePlayer.isMuted()
            });
        }

        this.mute = function(state) {
            if (!_youtubePlayer || !_youtubePlayer.getVolume) {
                return;
            }
            if (!utils.exists(state)) {
                state = !_youtubePlayer.isMuted();
            }

            if (state) {
                _lastVolume = _youtubePlayer.getVolume();
                _youtubePlayer.mute();
            } else {
                this.volume(_lastVolume);
                _youtubePlayer.unMute();
            }
        };

        this.detachMedia = function() {
            // temp return a video element so instream doesn't break.
            // FOR VAST: prevent instream from being initialized while casting

            return document.createElement('video');
        };

        this.attachMedia = function() {
            if (_beforecompleted) {
                this.setState(states.IDLE);
                this.sendEvent(events.JWPLAYER_MEDIA_COMPLETE);
                _beforecompleted = false;
            }
        };

        this.setContainer = function(parent) {
            _container = parent;
            parent.appendChild(_element);
            this.setVisibility(true);
        };

        this.getContainer = function() {
            return _container;
        };

        this.supportsFullscreen = function() {
            return !!(_container && (_container.requestFullscreen ||
                _container.requestFullScreen ||
                _container.webkitRequestFullscreen ||
                _container.webkitRequestFullScreen ||
                _container.webkitEnterFullscreen ||
                _container.webkitEnterFullScreen ||
                _container.mozRequestFullScreen ||
                _container.msRequestFullscreen));
        };

        this.remove = function() {
            _stopVideo();

            // remove element
            if (_element && _container && _container === _element.parentNode) {
                _container.removeChild(_element);
            }

            _youtubeEmbedReadyCallback =
                _youtubePlayerReadyCallback =
                    _youtubePlayer = null;
        };

        this.setVisibility = function(state) {
            state = !!state;
            if (state) {
                // show
                utils.css.style(_element, {
                    display: 'block'
                });
                utils.css.style(_container, {
                    visibility: 'visible',
                    opacity: 1
                });
            } else {
                // hide
                if (!_isMobile) {
                    utils.css.style(_container, {
                        opacity: 0
                    });
                }
            }
        };

        this.resize = function(width, height, stretching) {
            return utils.stretch(stretching,
                _element,
                width, height,
                _element.clientWidth, _element.clientHeight);
        };

        this.checkComplete = function() {
            return _beforecompleted;
        };

        this.getCurrentQuality = function() {
            if (!_youtubePlayer) {
                return;
            }
            if (_youtubePlayer.getAvailableQualityLevels) {
                var ytQuality = _youtubePlayer.getPlaybackQuality();
                var ytLevels = _youtubePlayer.getAvailableQualityLevels();
                return ytLevels.indexOf(ytQuality);
            }
            return -1;
        };

        this.getQualityLevels = function() {
            if (!_youtubePlayer) {
                return;
            }

            if (!_.isFunction(_youtubePlayer.getAvailableQualityLevels)) {
                return [];
            }

            var ytLevels = _youtubePlayer.getAvailableQualityLevels();

            // If the result is ['auto', 'low'], we prefer to return ['low']
            if (ytLevels.length === 2 && _.contains(ytLevels, 'auto')) {
                return {
                    label : _.without(ytLevels, 'auto')
                };
            }

            var qualityArray = _.map(ytLevels, function(val) {
                return {
                    label : val
                };
            });

            // We expect them in decreasing order
            return qualityArray.reverse();
        };

        this.setCurrentQuality = function(quality) {
            if (!_youtubePlayer) {
                return;
            }
            if (_youtubePlayer.getAvailableQualityLevels) {
                var ytLevels = _youtubePlayer.getAvailableQualityLevels();
                if (ytLevels.length) {
                    var ytQuality = ytLevels[ytLevels.length - quality - 1];
                    _youtubePlayer.setPlaybackQuality(ytQuality);
                }
            }
        };
    }

    // Clear up the memory, this is called by Google
    window.onYouTubeIframeAPIReady = function() {
        _scriptLoader = null;
    };

    function supports(source) {
        return (utils.isYouTube(source.file, source.type));
    }

    // Required configs
    var F = function(){};
    F.prototype = DefaultProvider;
    YoutubeProvider.prototype = new F();
    YoutubeProvider.supports = supports;

    jwplayer.html5.YoutubeProvider = YoutubeProvider;

})(jwplayer);
/* jshint maxparams:9, maxlen:9000 */
(function(jwplayer) {
    var _utils = jwplayer.utils,
        _css = _utils.css,
        _events = jwplayer.events,
        VIEW_INSTREAM_SKIP_CLASS = 'jwskip',
        VIEW_INSTREAM_IMAGE = 'jwskipimage',
        VIEW_INSTREAM_OVER = 'jwskipover',
        VIEW_INSTREAM_OUT = 'jwskipout',
        _SKIP_WIDTH = 80,
        _SKIP_HEIGHT = 30,
        _SKIP_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAICAYAAAArzdW1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0ODkzMWI3Ny04YjE5LTQzYzMtOGM2Ni0wYzdkODNmZTllNDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDI0OTcxRkE0OEM2MTFFM0I4MTREM0ZBQTFCNDE3NTgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDI0OTcxRjk0OEM2MTFFM0I4MTREM0ZBQTFCNDE3NTgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDA5ZGQxNDktNzdkMi00M2E3LWJjYWYtOTRjZmM2MWNkZDI0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjQ4OTMxYjc3LThiMTktNDNjMy04YzY2LTBjN2Q4M2ZlOWU0NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqAZXX0AAABYSURBVHjafI2BCcAwCAQ/kr3ScRwjW+g2SSezCi0kYHpwKLy8JCLDbWaGTM+MAFzuVNXhNiTQsh+PS9QhZ7o9JuFMeUVNwjsamDma4K+3oy1cqX/hxyPAAAQwNKV27g9PAAAAAElFTkSuQmCC',
        _SKIP_ICON_OVER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAICAYAAAArzdW1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0ODkzMWI3Ny04YjE5LTQzYzMtOGM2Ni0wYzdkODNmZTllNDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDI0OTcxRkU0OEM2MTFFM0I4MTREM0ZBQTFCNDE3NTgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDI0OTcxRkQ0OEM2MTFFM0I4MTREM0ZBQTFCNDE3NTgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDA5ZGQxNDktNzdkMi00M2E3LWJjYWYtOTRjZmM2MWNkZDI0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjQ4OTMxYjc3LThiMTktNDNjMy04YzY2LTBjN2Q4M2ZlOWU0NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvgIj/QAAABYSURBVHjadI6BCcAgDAS/0jmyih2tm2lHSRZJX6hQQ3w4FP49LKraSHV3ZLDzAuAi3cwaqUhSfvft+EweznHneUdTzPGRmp5hEJFhAo3LaCnjn7blzCvAAH9YOSCL5RZKAAAAAElFTkSuQmCC';

    jwplayer.html5.adskipbutton = function(_playerId, _bottom, _skipMessage, _skipText) {
        var _instreamSkipContainer,
            _instreamSkip,
            _offsetTime = -1,
            _instreamSkipSet = false,
            _controls,
            _skipOffset = 0,
            _skip_image,
            _skip_image_over,
            _mouseOver = false,
            _this = _utils.extend(this, new _events.eventdispatcher());

        function _init() {
            _skip_image = new Image();
            _skip_image.src = _SKIP_ICON;
            _skip_image.className = VIEW_INSTREAM_IMAGE + ' ' + VIEW_INSTREAM_OUT;
            _skip_image_over = new Image();
            _skip_image_over.src = _SKIP_ICON_OVER;
            _skip_image_over.className = VIEW_INSTREAM_IMAGE + ' ' + VIEW_INSTREAM_OVER;
            _instreamSkipContainer = _createElement('div', VIEW_INSTREAM_SKIP_CLASS);
            _instreamSkipContainer.id = _playerId + '_skipcontainer';
            _instreamSkip = _createElement('canvas');
            _instreamSkipContainer.appendChild(_instreamSkip);
            _this.width = _instreamSkip.width = _SKIP_WIDTH;
            _this.height = _instreamSkip.height = _SKIP_HEIGHT;
            _instreamSkipContainer.appendChild(_skip_image_over);
            _instreamSkipContainer.appendChild(_skip_image);
            _css.style(_instreamSkipContainer, {
                'visibility': 'hidden',
                'bottom': _bottom
            });
            // add event listeners once, exit with !_instreamSkipSet
            _instreamSkipContainer.addEventListener('mouseover', onMouseOver);
            _instreamSkipContainer.addEventListener('mouseout', onMouseOut);
            if (_utils.isMobile()) {
                var skipTouch = new _utils.touch(_instreamSkipContainer);
                skipTouch.addEventListener(_utils.touchEvents.TAP, skipAd);
            } else {
                _instreamSkipContainer.addEventListener('click', skipAd);
            }
        }


        function _updateTime(currTime) {
            if (_offsetTime < 0) {
                return;
            }
            var message = _skipMessage.replace(/xx/gi, Math.ceil(_offsetTime - currTime));
            drawOut(message);
        }

        function _updateOffset(pos, duration) {
            if (_utils.typeOf(_skipOffset) === 'number') {
                _offsetTime = _skipOffset;
            } else if (_skipOffset.slice(-1) === '%') {
                var percent = parseFloat(_skipOffset.slice(0, -1));
                if (duration && !isNaN(percent)) {
                    _offsetTime = duration * percent / 100;
                }
            } else if (_utils.typeOf(_skipOffset) === 'string') {
                _offsetTime = _utils.seconds(_skipOffset);
            } else if (!isNaN(_skipOffset)) {
                _offsetTime = _skipOffset;
            }
        }

        _this.updateSkipTime = function(time, duration) {
            _updateOffset(time, duration);
            if (_offsetTime >= 0) {
                _css.style(_instreamSkipContainer, {
                    'visibility': _controls ? 'visible' : 'hidden'
                });
                if (_offsetTime - time > 0) {
                    _updateTime(time);
                    if (_instreamSkipSet) {
                        _instreamSkipSet = false;
                        _instreamSkipContainer.style.cursor = 'default';
                    }
                } else if (!_instreamSkipSet) {
                    if (!_instreamSkipSet) {
                        _instreamSkipSet = true;
                        _instreamSkipContainer.style.cursor = 'pointer';
                    }
                    if (_mouseOver) {
                        drawOver();
                    } else {
                        drawOut();
                    }
                }
            }
        };

        function skipAd() {
            if (_instreamSkipSet) {
                _this.sendEvent(_events.JWPLAYER_AD_SKIPPED);
            }
        }

        this.reset = function(offset) {
            _instreamSkipSet = false;
            _skipOffset = offset;
            _updateOffset(0, 0);
            _updateTime(0);
        };

        function onMouseOver() {
            _mouseOver = true;
            if (_instreamSkipSet) {
                drawOver();
            }
        }

        function onMouseOut() {
            _mouseOver = false;
            if (_instreamSkipSet) {
                drawOut();
            }
        }

        function drawOut(message) {
            message = message || _skipText;

            var ctx = _instreamSkip.getContext('2d');
            ctx.clearRect(0, 0, _SKIP_WIDTH, _SKIP_HEIGHT);
            drawRoundRect(ctx, 0, 0, _SKIP_WIDTH, _SKIP_HEIGHT, 5, true, false, false);
            drawRoundRect(ctx, 0, 0, _SKIP_WIDTH, _SKIP_HEIGHT, 5, false, true, false);
            ctx.fillStyle = '#979797';
            ctx.globalAlpha = 1.0;
            var y = _instreamSkip.height / 2;
            var x = _instreamSkip.width / 2;
            ctx.textAlign = 'center';
            ctx.font = 'Bold 12px Sans-Serif';
            if (message === _skipText) {
                x -= _skip_image.width;
                ctx.drawImage(_skip_image, _instreamSkip.width - ((_instreamSkip.width - ctx.measureText(_skipText).width) / 2) - 4, (_SKIP_HEIGHT - _skip_image.height) / 2);
            }
            ctx.fillText(message, x, y + 4);
        }

        function drawOver(message) {
            message = message || _skipText;

            var ctx = _instreamSkip.getContext('2d');
            ctx.clearRect(0, 0, _SKIP_WIDTH, _SKIP_HEIGHT);
            drawRoundRect(ctx, 0, 0, _SKIP_WIDTH, _SKIP_HEIGHT, 5, true, false, true);
            drawRoundRect(ctx, 0, 0, _SKIP_WIDTH, _SKIP_HEIGHT, 5, false, true, true);
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 1.0;
            var y = _instreamSkip.height / 2;
            var x = _instreamSkip.width / 2;
            ctx.textAlign = 'center';
            ctx.font = 'Bold 12px Sans-Serif';
            if (message === _skipText) {
                x -= _skip_image.width;
                ctx.drawImage(_skip_image_over, _instreamSkip.width - ((_instreamSkip.width - ctx.measureText(_skipText).width) / 2) - 4, (_SKIP_HEIGHT - _skip_image.height) / 2);
            }
            ctx.fillText(message, x, y + 4);
        }

        function drawRoundRect(ctx, x, y, width, height, radius, fill, stroke, over) {
            if (typeof stroke === 'undefined') {
                stroke = true;
            }
            if (typeof radius === 'undefined') {
                radius = 5;
            }
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            if (stroke) {
                ctx.strokeStyle = 'white';
                ctx.globalAlpha = over ? 1.0 : 0.25;
                ctx.stroke();
            }
            if (fill) {
                ctx.fillStyle = '#000000';
                ctx.globalAlpha = 0.5;
                ctx.fill();
            }
        }

        _this.show = function() {
            _controls = true;
            if (_offsetTime > 0) {
                _css.style(_instreamSkipContainer, {
                    'visibility': 'visible'
                });
            }
        };

        _this.hide = function() {
            _controls = false;
            _css.style(_instreamSkipContainer, {
                'visibility': 'hidden'
            });
        };

        function _createElement(elem, className) {
            var newElement = document.createElement(elem);
            if (className) {
                newElement.className = className;
            }
            return newElement;
        }

        this.element = function() {
            return _instreamSkipContainer;
        };

        _init();
    };

    _css('.' + VIEW_INSTREAM_SKIP_CLASS, {
        'position': 'absolute',
        'float': 'right',
        'display': 'inline-block',
        'width': _SKIP_WIDTH,
        'height': _SKIP_HEIGHT,
        'right': 10
    });

    _css('.' + VIEW_INSTREAM_IMAGE, {
        'position': 'relative',
        'display': 'none'
    });

})(window.jwplayer);
(function(jwplayer) {

    var html5 = jwplayer.html5,
        utils = jwplayer.utils,
        events = jwplayer.events,
        states = events.state,
        parsers = jwplayer.parsers,
        _css = utils.css,
        _nonChromeAndroid = utils.isAndroid(4, true),
        PLAYING = 'playing',

        D_CLASS = '.jwcaptions',

        /** Some CSS constants we should use for minimization **/
        JW_CSS_ABSOLUTE = 'absolute',
        JW_CSS_NONE = 'none',
        JW_CSS_100PCT = '100%',
        JW_CSS_HIDDEN = 'hidden',
        JW_CSS_NORMAL = 'normal',
        JW_CSS_WHITE = '#FFFFFF';

    /** Displays closed captions or subtitles on top of the video. **/
    html5.captions = function(api, options) {

        var _api = api,
            _display,
            _defaults = {
                back: true,
                color: JW_CSS_WHITE,
                fontSize: 15,
                fontFamily: 'Arial,sans-serif',
                fontOpacity: 100,
                backgroundColor: '#000',
                backgroundOpacity: 100,
                // if back == false edgeStyle defaults to 'uniform',
                // otherwise it's 'none'
                edgeStyle: null,
                windowColor: JW_CSS_WHITE,
                windowOpacity: 0
            },

            /** Default configuration options. **/
            _options = {
                fontStyle: JW_CSS_NORMAL,
                fontWeight: JW_CSS_NORMAL,
                textDecoration: JW_CSS_NONE
            },

            /** Reference to the text renderer. **/
            _renderer,
            /** Current player state. **/
            _state,
            /** Currently active captions track. **/
            _track,
            /** List with all tracks. **/
            _tracks = [],
            /**counter for downloading all the tracks**/
            _dlCount = 0,

            _waiting = -1,
            /** Currently selected track in the displayed track list. **/
            _selectedTrack = 0,
            /** Flag to remember fullscreen state. **/
            _fullscreen = false,
            /** Event dispatcher for captions events. **/
            _eventDispatcher = new events.eventdispatcher();

        utils.extend(this, _eventDispatcher);

        function _init() {

            _display = document.createElement('div');
            _display.id = _api.id + '_caption';
            _display.className = 'jwcaptions';

            _api.jwAddEventListener(events.JWPLAYER_PLAYER_STATE, _stateHandler);
            _api.jwAddEventListener(events.JWPLAYER_PLAYLIST_ITEM, _itemHandler);
            _api.jwAddEventListener(events.JWPLAYER_MEDIA_ERROR, _errorHandler);
            _api.jwAddEventListener(events.JWPLAYER_ERROR, _errorHandler);
            _api.jwAddEventListener(events.JWPLAYER_READY, _setup);
            _api.jwAddEventListener(events.JWPLAYER_MEDIA_TIME, _timeHandler);
            _api.jwAddEventListener(events.JWPLAYER_FULLSCREEN, _fullscreenHandler);
            _api.jwAddEventListener(events.JWPLAYER_RESIZE, _resizeHandler);
        }

        function _resizeHandler() {
            _redraw(false);
        }

        /** Error loading/parsing the captions. **/
        function _errorHandler(error) {
            utils.log('CAPTIONS(' + error + ')');
        }

        /** Player jumped to idle state. **/
        function _idleHandler() {
            _state = 'idle';
            _redraw(false);
            //_renderer.update(0);
        }

        function _stateHandler(evt) {
            switch (evt.newstate) {
                case states.IDLE:
                    _idleHandler();
                    break;
                case states.PLAYING:
                    _playHandler();
                    break;
            }
        }

        function _fullscreenHandler(event) {
            _fullscreen = event.fullscreen;
            if (event.fullscreen) {
                _fullscreenResize();
                // to fix browser fullscreen issue
                setTimeout(_fullscreenResize, 500);
            } else {
                _redraw(true);
            }

        }

        function _fullscreenResize() {
            var height = _display.offsetHeight,
                width = _display.offsetWidth;
            if (height !== 0 && width !== 0) {
                _renderer.resize(width, Math.round(height * 0.94));
            }
        }

        /** Listen to playlist item updates. **/
        function _itemHandler() {
            _track = 0;
            _tracks = [];
            _renderer.update(0);
            _dlCount = 0;

            var item = _api.jwGetPlaylist()[_api.jwGetPlaylistIndex()],
                tracks = item.tracks,
                captions = [],
                i = 0,
                label = '',
                defaultTrack = 0,
                file = '',
                cookies;

            for (i = 0; i < tracks.length; i++) {
                var kind = tracks[i].kind.toLowerCase();
                if (kind === 'captions' || kind === 'subtitles') {
                    captions.push(tracks[i]);
                }
            }

            _selectedTrack = 0;
            if (_nonChromeAndroid) {
                return;
            }
            for (i = 0; i < captions.length; i++) {
                file = captions[i].file;
                if (file) {
                    if (!captions[i].label) {
                        captions[i].label = i.toString();

                    }
                    _tracks.push(captions[i]);
                    _load(_tracks[i].file, i);
                }
            }

            for (i = 0; i < _tracks.length; i++) {
                if (_tracks[i]['default']) {
                    defaultTrack = i + 1;
                    break;
                }
            }

            cookies = utils.getCookies();
            label = cookies.captionLabel;

            if (label) {
                tracks = _getTracks();
                for (i = 0; i < tracks.length; i++) {
                    if (label === tracks[i].label) {
                        defaultTrack = i;
                        break;
                    }
                }
            }
            if (defaultTrack > 0) {
                _renderCaptions(defaultTrack);
            }
            _redraw(false);
            _sendEvent(events.JWPLAYER_CAPTIONS_LIST, _getTracks(), _selectedTrack);
        }

        /** Load captions. **/
        function _load(file, index) {
            utils.ajax(file, function(xmlEvent) {
                _xmlReadHandler(xmlEvent, index);
            }, _xmlFailedHandler, true);
        }

        function _xmlReadHandler(xmlEvent, index) {
            var rss = xmlEvent.responseXML ? xmlEvent.responseXML.firstChild : null,
                parser;
            _dlCount++;
            // IE9 sets the firstChild element to the root <xml> tag

            if (rss) {
                if (parsers.localName(rss) === 'xml') {
                    rss = rss.nextSibling;
                }
                // Ignore all comments
                while (rss.nodeType === rss.COMMENT_NODE) {
                    rss = rss.nextSibling;
                }
            }
            if (rss && parsers.localName(rss) === 'tt') {
                parser = new jwplayer.parsers.dfxp();
            } else {
                parser = new jwplayer.parsers.srt();
            }
            try {
                var data = parser.parse(xmlEvent.responseText);
                if (_track < _tracks.length) {
                    _tracks[index].data = data;
                }
                _redraw(false);
            } catch (e) {
                _errorHandler(e.message + ': ' + _tracks[index].file);
            }

            if (_dlCount === _tracks.length) {
                if (_waiting > 0) {
                    _renderCaptions(_waiting);
                    _waiting = -1;
                }
                sendAll();
            }
        }

        function _xmlFailedHandler(message) {
            _dlCount++;
            _errorHandler(message);
            if (_dlCount === _tracks.length) {
                if (_waiting > 0) {
                    _renderCaptions(_waiting);
                    _waiting = -1;
                }
                sendAll();
            }
        }


        function sendAll() {

            var data = [];
            for (var i = 0; i < _tracks.length; i++) {
                data.push(_tracks[i]);
            }
            _eventDispatcher.sendEvent(events.JWPLAYER_CAPTIONS_LOADED, {
                captionData: data
            });
        }

        /** Player started playing. **/
        function _playHandler() {
            _state = PLAYING;
            _redraw(false);
        }

        /** Update the interface. **/
        function _redraw(timeout) {
            if (!_tracks.length) {
                _renderer.hide();
            } else {
                if (_state === PLAYING && _selectedTrack > 0) {
                    _renderer.show();
                    if (_fullscreen) {
                        _fullscreenHandler({
                            fullscreen: true
                        });
                        return;
                    }
                    _normalResize();
                    if (timeout) {
                        setTimeout(_normalResize, 500);
                    }
                } else {
                    _renderer.hide();
                }
            }
        }

        function _normalResize() {
            _renderer.resize();
        }

        /** Setup captions when player is ready. **/
        function _setup() {
            utils.foreach(_defaults, function(rule, val) {
                if (options) {
                    if (options[rule] !== undefined) {
                        val = options[rule];
                    } else if (options[rule.toLowerCase()] !== undefined) {
                        val = options[rule.toLowerCase()];
                    }
                }
                _options[rule] = val;
            });

            // Place renderer and selector.
            _renderer = new jwplayer.html5.captions.renderer(_options, _display);
            _redraw(false);
        }


        /** Selection menu was closed. **/
        function _renderCaptions(index) {
            // Store new state and track
            if (index > 0) {
                _track = index - 1;
                _selectedTrack = Math.floor(index);
            } else {
                _selectedTrack = 0;
                _redraw(false);
                return;
            }

            if (_track >= _tracks.length) {
                return;
            }

            // Load new captions
            if (_tracks[_track].data) {
                _renderer.populate(_tracks[_track].data);
            } else if (_dlCount === _tracks.length) {
                _errorHandler('file not loaded: ' + _tracks[_track].file);
                if (_selectedTrack !== 0) {
                    _sendEvent(events.JWPLAYER_CAPTIONS_CHANGED, _tracks, 0);
                }
                _selectedTrack = 0;
            } else {
                _waiting = index;
            }
            _redraw(false);
        }


        /** Listen to player time updates. **/
        function _timeHandler(event) {
            _renderer.update(event.position);
        }

        function _sendEvent(type, tracks, track) {
            var captionsEvent = {
                type: type,
                tracks: tracks,
                track: track
            };
            _eventDispatcher.sendEvent(type, captionsEvent);
        }

        function _getTracks() {
            var list = [{
                label: 'Off'
            }];
            for (var i = 0; i < _tracks.length; i++) {
                list.push({
                    label: _tracks[i].label
                });
            }
            return list;
        }

        this.element = function() {
            return _display;
        };

        this.getCaptionsList = function() {
            return _getTracks();
        };

        this.getCurrentCaptions = function() {
            return _selectedTrack;
        };

        this.setCurrentCaptions = function(index) {
            if (index >= 0 && _selectedTrack !== index && index <= _tracks.length) {
                _renderCaptions(index);
                var tracks = _getTracks();
                utils.saveCookie('captionLabel', tracks[_selectedTrack].label);
                _sendEvent(events.JWPLAYER_CAPTIONS_CHANGED, tracks, _selectedTrack);
            }
        };

        _init();
    };

    _css(D_CLASS, {
        position: JW_CSS_ABSOLUTE,
        cursor: 'pointer',
        width: JW_CSS_100PCT,
        height: JW_CSS_100PCT,
        overflow: JW_CSS_HIDDEN
    });

})(jwplayer);
(function(jwplayer) {
    var html5 = jwplayer.html5,
        utils = jwplayer.utils,
        _style = utils.css.style;

    /** Component that renders the actual captions on screen. **/
    html5.captions.renderer = function(_options, _div) {

        /** Current list with captions. **/
        var _captions,
            /** Container of captions window. **/
            _container,
            /** Container of captions text. **/
            _captionsWindow,
            /** Text container of captions. **/
            _textContainer,
            /** Current actie captions entry. **/
            _current,
            /** Current video position. **/
            _position,
            /** Should the captions be visible or not. **/
            _visible = 'visible',
            /** Interval for resize. **/
            _interval = -1;


        /** Hide the rendering component. **/
        this.hide = function() {
            clearInterval(_interval);
            _style(_container, {
                display: 'none'
            });
        };

        /** Assign list of captions to the renderer. **/
        this.populate = function(captions) {
            _current = -1;
            _captions = captions;
            _select();
        };

        /** Render the active caption. **/
        function _render(html) {
            html = html || '';
            //hide containers before resizing
            _visible = 'hidden';
            _style(_container, {
                visibility: _visible
            });
            //update text and resize after delay
            _textContainer.innerHTML = html;
            if (html.length) {
                _visible = 'visible';
                setTimeout(_resize, 16);
            }
        }

        /** Store new dimensions. **/
        this.resize = function() {
            _resize();
        };

        /** Resize the captions. **/
        function _resize() {
            // only resize if visible
            if (_visible === 'visible') {
                var width = _container.clientWidth,
                    scale = Math.pow(width / 400, 0.6);

                var size = _options.fontSize * scale;
                _style(_textContainer, {
                    maxWidth: width + 'px',
                    fontSize: Math.round(size) + 'px',
                    lineHeight: Math.round(size * 1.4) + 'px',
                    padding: Math.round(1 * scale) + 'px ' + Math.round(8 * scale) + 'px'
                });
                if (_options.windowOpacity) {
                    _style(_captionsWindow, {
                        padding: Math.round(5 * scale) + 'px',
                        borderRadius: Math.round(5 * scale) + 'px'
                    });
                }
                _style(_container, {
                    visibility: _visible
                });
            }
        }

        /** Select a caption for rendering. **/
        function _select() {
            var found = -1;
            for (var i = 0; i < _captions.length; i++) {
                if (_captions[i].begin <= _position &&
                    (i === _captions.length - 1 || _captions[i + 1].begin >= _position)) {
                    found = i;
                    break;
                }
            }
            // If none, empty the text. If not current, re-render.
            if (found === -1) {
                _render('');
            } else if (found !== _current) {
                _current = found;
                _render(_captions[i].text);
            }
        }

        /** Constructor for the renderer. **/
        function _setup() {
            var fontOpacity = _options.fontOpacity,
                windowOpacity = _options.windowOpacity,
                edgeStyle = _options.edgeStyle,
                bgColor = _options.backgroundColor,
                windowStyle = {
                    display: 'inline-block'
                },
                textStyle = {
                    color: utils.hexToRgba(utils.rgbHex(_options.color), fontOpacity),
                    display: 'inline-block',
                    fontFamily: _options.fontFamily,
                    fontStyle: _options.fontStyle,
                    fontWeight: _options.fontWeight,
                    textAlign: 'center',
                    textDecoration: _options.textDecoration,
                    wordWrap: 'break-word'
                };

            if (windowOpacity) {
                windowStyle.backgroundColor = utils.hexToRgba(utils.rgbHex(_options.windowColor), windowOpacity);
            }

            addEdgeStyle(edgeStyle, textStyle, fontOpacity);

            if (_options.back) {
                textStyle.backgroundColor = utils.hexToRgba(utils.rgbHex(bgColor), _options.backgroundOpacity);
            } else if (edgeStyle === null) {
                addEdgeStyle('uniform', textStyle);
            }

            _container = document.createElement('div');
            _captionsWindow = document.createElement('div');
            _textContainer = document.createElement('span');

            _style(_container, {
                display: 'block',
                height: 'auto',
                position: 'absolute',
                bottom: '20px',
                textAlign: 'center',
                width: '100%'
            });

            _style(_captionsWindow, windowStyle);

            _style(_textContainer, textStyle);

            _captionsWindow.appendChild(_textContainer);
            _container.appendChild(_captionsWindow);
            _div.appendChild(_container);
        }

        function addEdgeStyle(option, style, fontOpacity) {
            var color = utils.hexToRgba('#000000', fontOpacity);
            if (option === 'dropshadow') { // small drop shadow
                style.textShadow = '0 2px 1px ' + color;
            } else if (option === 'raised') { // larger drop shadow
                style.textShadow = '0 0 5px ' + color + ', 0 1px 5px ' + color + ', 0 2px 5px ' + color;
            } else if (option === 'depressed') { // top down shadow
                style.textShadow = '0 -2px 1px ' + color;
            } else if (option === 'uniform') { // outline
                style.textShadow = '-2px 0 1px ' + color + ',2px 0 1px ' + color +
                    ',0 -2px 1px ' + color + ',0 2px 1px ' + color + ',-1px 1px 1px ' +
                    color + ',1px 1px 1px ' + color + ',1px -1px 1px ' + color +
                    ',1px 1px 1px ' + color;
            }
        }

        /** Show the rendering component. **/
        this.show = function() {
            _style(_container, {
                display: 'block'
            });
            _resize();
            clearInterval(_interval);
            _interval = setInterval(_resize, 250);
        };

        /** Update the video position. **/
        this.update = function(position) {
            _position = position;
            if (_captions) {
                _select();
            }
        };

        _setup();
    };

})(jwplayer);
/*jshint maxparams:5*/
(function(window, document, undefined) {
    var jwplayer = window.jwplayer,
        html5 = jwplayer.html5,
        utils = jwplayer.utils,
        _     = jwplayer._,
        events = jwplayer.events,
        states = events.state,
        _css = utils.css,
        _setTransition = utils.transitionStyle,
        _isMobile = utils.isMobile(),
        _nonChromeAndroid = utils.isAndroid(4, true),
        _iFramed = (window.top !== window.self),

        /** Controlbar element types * */
        CB_BUTTON = 'button',
        CB_TEXT = 'text',
        CB_DIVIDER = 'divider',
        CB_SLIDER = 'slider',

        JW_VISIBILITY_TIMEOUT = 250,

        HIDDEN = {
            display: 'none'
        },
        SHOWING = {
            display: 'block'
        },
        NOT_HIDDEN = {
            display: ''
        };

    function _removeFromArray(array, item) {
        var index = _.indexOf(array, item);
        if (index > -1) {
            array.splice(index, 1);
        }
    }

    function _addOnceToArray(array, item) {
        var index = _.indexOf(array, item);
        if (index === -1) {
            array.push(item);
        }
    }

    function _createElementId(_id, name) {
        return _id + '_' + name;
    }

    function _elementSize(skinElem) {
        return skinElem ? parseInt(skinElem.width, 10) + 'px ' + parseInt(skinElem.height, 10) + 'px' : '0 0';
    }


    /** HTML5 Controlbar class * */
    html5.controlbar = function(_api, _config) {
        _config = _config || {};
        var _skin,
            _dividerElement = _layoutElement('divider', CB_DIVIDER),
            _defaults = {
                margin: 8,
                maxwidth: 800,
                font: 'Arial,sans-serif',
                fontsize: 11,
                fontcolor: parseInt('eeeeee', 16),
                fontweight: 'bold',
                layout: {
                    left: {
                        position: 'left',
                        elements: [
                            _layoutElement('play', CB_BUTTON),
                            _layoutElement('prev', CB_BUTTON),
                            _layoutElement('next', CB_BUTTON),
                            _layoutElement('elapsed', CB_TEXT)
                        ]
                    },
                    center: {
                        position: 'center',
                        elements: [
                            _layoutElement('time', CB_SLIDER),
                            _layoutElement('alt', CB_TEXT)
                        ]
                    },
                    right: {
                        position: 'right',
                        elements: [
                            _layoutElement('duration', CB_TEXT),
                            _layoutElement('hd', CB_BUTTON),
                            _layoutElement('cc', CB_BUTTON),
                            _layoutElement('mute', CB_BUTTON),
                            _layoutElement('volume', CB_SLIDER),
                            _layoutElement('volumeH', CB_SLIDER),
                            _layoutElement('cast', CB_BUTTON),
                            _layoutElement('fullscreen', CB_BUTTON)
                        ]
                    }
                }
            },

            _settings,
            _layout,
            _elements,
            _bgHeight,
            _controlbar,
            _id,
            _duration,
            _position,
            _levels = [],
            _currentQuality,
            _captions,
            _currentCaptions,
            _currentVolume,
            _castState = {},
            _volumeOverlay,
            _cbBounds,
            _timeRail,
            _railBounds,
            _timeOverlay,
            _timeOverlayContainer,
            _timeOverlayThumb,
            _timeOverlayText,
            _hdTimer,
            _hdTapTimer,
            _hdOverlay,
            _ccTimer,
            _ccTapTimer,
            _ccOverlay,
            _redrawTimeout,
            _hideTimeout = -1,
            _audioMode = false,
            _instreamMode = false,
            _adMode = false,
            _hideFullscreen = false,
            _dragging = null,
            _lastSeekTime = 0,
            _cues = [],
            _activeCue,
            _toggles = {
                play: 'pause',
                mute: 'unmute',
                cast: 'casting',
                fullscreen: 'normalscreen'
            },

            _toggleStates = {
                play: false,
                mute: false,
                cast: false,
                fullscreen: _config.fullscreen || false
            },

            _buttonMapping = {
                play: _play,
                mute: _mute,
                fullscreen: _fullscreen,
                next: _next,
                prev: _prev,
                hd: _hd,
                cc: _cc,
                cast: _cast
            },

            _sliderMapping = {
                time: _seek,
                volume: _volume
            },

            _overlays = {},
            _jwhidden = [],
            _this = utils.extend(this, new events.eventdispatcher());

        function _layoutElement(name, type, className) {
            return {
                name: name,
                type: type,
                className: className
            };
        }

        function _init() {
            _elements = {};

            _id = _api.id + '_controlbar';
            _duration = _position = 0;

            _controlbar = _createSpan();
            _controlbar.id = _id;
            _controlbar.className = 'jwcontrolbar';

            _skin = _api.skin;
            _layout = _skin.getComponentLayout('controlbar');
            if (!_layout) {
                _layout = _defaults.layout;
            }
            utils.clearCss(_internalSelector());
            _css.block(_id + 'build');
            _createStyles();
            _buildControlbar();
            _css.unblock(_id + 'build');
            _addEventListeners();
            setTimeout(_volumeHandler, 0);
            _playlistHandler();
            _this.visible = false;
            _castAvailable();
        }

        function _addEventListeners() {
            _api.jwAddEventListener(events.JWPLAYER_MEDIA_TIME, _timeUpdated);
            _api.jwAddEventListener(events.JWPLAYER_PLAYER_STATE, _stateHandler);
            _api.jwAddEventListener(events.JWPLAYER_PLAYLIST_ITEM, _itemHandler);
            _api.jwAddEventListener(events.JWPLAYER_MEDIA_MUTE, _volumeHandler);
            _api.jwAddEventListener(events.JWPLAYER_MEDIA_VOLUME, _volumeHandler);
            _api.jwAddEventListener(events.JWPLAYER_MEDIA_BUFFER, _bufferHandler);
            _api.jwAddEventListener(events.JWPLAYER_FULLSCREEN, _fullscreenHandler);
            _api.jwAddEventListener(events.JWPLAYER_PLAYLIST_LOADED, _playlistHandler);
            _api.jwAddEventListener(events.JWPLAYER_MEDIA_LEVELS, _qualityHandler);
            _api.jwAddEventListener(events.JWPLAYER_MEDIA_LEVEL_CHANGED, _qualityLevelChanged);
            _api.jwAddEventListener(events.JWPLAYER_CAPTIONS_LIST, _captionsHandler);
            _api.jwAddEventListener(events.JWPLAYER_CAPTIONS_CHANGED, _captionChanged);
            _api.jwAddEventListener(events.JWPLAYER_RESIZE, _resizeHandler);
            _api.jwAddEventListener(events.JWPLAYER_CAST_AVAILABLE, _castAvailable);
            _api.jwAddEventListener(events.JWPLAYER_CAST_SESSION, _castSession);

            if (!_isMobile) {
                _controlbar.addEventListener('mouseover', function() {
                    // Slider listeners
                    window.addEventListener('mousedown', _killSelect, false);
                }, false);
                _controlbar.addEventListener('mouseout', function() {
                    // Slider listeners
                    window.removeEventListener('mousedown', _killSelect);
                    document.onselectstart = null;
                }, false);
            }
        }

        function _resizeHandler() {
            _cbBounds = utils.bounds(_controlbar);
            if (_cbBounds.width > 0) {
                _this.show(true);
            }
        }

        function isLiveStream(evt) {
            var isIpadStream = (evt.duration === Number.POSITIVE_INFINITY);
            var isSafariStream = (evt.duration === 0 && evt.position !== 0 && utils.isSafari() && !_isMobile);

            return isIpadStream || isSafariStream;
        }

        function _timeUpdated(evt) {
            _css.block(_id); //unblock on redraw

            // Positive infinity for live streams on iPad, 0 for live streams on Safari (HTML5)
            if (isLiveStream(evt)) {
                _this.setText(_api.jwGetPlaylist()[_api.jwGetPlaylistIndex()].title || 'Live broadcast');

                // so that elapsed time doesn't display for live streams
                _toggleTimesDisplay(false);
            } else {
                var timeString;
                if (_elements.elapsed) {
                    timeString = utils.timeFormat(evt.position);
                    _elements.elapsed.innerHTML = timeString;
                }
                if (_elements.duration) {
                    timeString = utils.timeFormat(evt.duration);
                    _elements.duration.innerHTML = timeString;
                }
                if (evt.duration > 0) {
                    _setProgress(evt.position / evt.duration);
                } else {
                    _setProgress(0);
                }
                _duration = evt.duration;
                _position = evt.position;
                if (!_instreamMode) {
                    _this.setText();
                }
            }
        }

        function _stateHandler(evt) {
            switch (evt.newstate) {
                case states.BUFFERING:
                case states.PLAYING:
                    if (_elements.timeSliderThumb) {
                        _css.style(_elements.timeSliderThumb, {
                            opacity: 1
                        });
                    }
                    _toggleButton('play', true);
                    break;
                case states.PAUSED:
                    if (!_dragging) {
                        _toggleButton('play', false);
                    }
                    break;
                case states.IDLE:
                    _toggleButton('play', false);
                    if (_elements.timeSliderThumb) {
                        _css.style(_elements.timeSliderThumb, {
                            opacity: 0
                        });
                    }
                    if (_elements.timeRail) {
                        _elements.timeRail.className = 'jwrail';
                    }
                    _setBuffer(0);
                    _timeUpdated({
                        position: 0,
                        duration: 0
                    });
                    break;
            }
        }

        function _itemHandler(evt) {
            if (!_instreamMode) {
                var tracks = _api.jwGetPlaylist()[evt.index].tracks,
                    tracksloaded = false,
                    cuesloaded = false;
                _removeCues();
                if (_.isArray(tracks) && !_isMobile) {
                    for (var i = 0; i < tracks.length; i++) {
                        if (!tracksloaded && tracks[i].file && tracks[i].kind &&
                            tracks[i].kind.toLowerCase() === 'thumbnails') {
                            _timeOverlayThumb.load(tracks[i].file);
                            tracksloaded = true;
                        }
                        if (tracks[i].file && tracks[i].kind &&
                            tracks[i].kind.toLowerCase() === 'chapters') {
                            _loadCues(tracks[i].file);
                            cuesloaded = true;
                        }
                    }
                }
                // If we're here, there are no thumbnails to load -
                // we should clear out the thumbs from the previous item
                if (!tracksloaded) {
                    _timeOverlayThumb.load();
                }
            }
        }

        function _volumeHandler() {
            var muted = _api.jwGetMute();
            _currentVolume = _api.jwGetVolume() / 100;
            _toggleButton('mute', muted || _currentVolume === 0);
            _setVolume(muted ? 0 : _currentVolume);
        }

        function _bufferHandler(evt) {
            _setBuffer(evt.bufferPercent / 100);
        }

        function _fullscreenHandler(evt) {
            _toggleButton('fullscreen', evt.fullscreen);
            _updateNextPrev();
            if (_this.visible) {
                _this.show(true);
            }
        }

        function _playlistHandler() {
            _css.style([
                _elements.hd,
                _elements.cc
            ], HIDDEN);

            _updateNextPrev();
            _redraw();
        }

        function _hasHD() {
            return (!_instreamMode && _levels.length > 1 && _hdOverlay);
        }

        function _qualityHandler(evt) {
            _levels = evt.levels || [];
            if (_hasHD()) {
                _css.style(_elements.hd, NOT_HIDDEN);
                _hdOverlay.clearOptions();
                for (var i = 0; i < _levels.length; i++) {
                    _hdOverlay.addOption(_levels[i].label, i);
                }
                _qualityLevelChanged(evt);
            } else {
                _css.style(_elements.hd, HIDDEN);
            }
            _redraw();
        }

        function _qualityLevelChanged(evt) {
            _currentQuality = Math.floor(evt.currentQuality);
            if (_elements.hd) {
                _elements.hd.querySelector('button').className =
                    (_levels.length === 2 && _currentQuality === 0) ? 'off' : '';
            }
            if (_hdOverlay && _currentQuality >= 0) {
                _hdOverlay.setActive(evt.currentQuality);
            }
        }

        function _hasCaptions() {
            return (!_instreamMode && _captions && _captions.length > 1 && _ccOverlay);
        }

        function _captionsHandler(evt) {
            _captions = evt.tracks;
            if (_hasCaptions()) {
                _css.style(_elements.cc, NOT_HIDDEN);
                _ccOverlay.clearOptions();
                for (var i = 0; i < _captions.length; i++) {
                    _ccOverlay.addOption(_captions[i].label, i);
                }
                _captionChanged(evt);
            } else {
                _css.style(_elements.cc, HIDDEN);
            }
            _redraw();
        }

        function _captionChanged(evt) {
            if (!_captions) {
                return;
            }
            _currentCaptions = Math.floor(evt.track);
            if (_elements.cc) {
                _elements.cc.querySelector('button').className =
                    (_captions.length === 2 && _currentCaptions === 0) ? 'off' : '';
            }
            if (_ccOverlay && _currentCaptions >= 0) {
                _ccOverlay.setActive(evt.track);
            }
        }

        function _castAvailable(evt) {
            // chromecast button is displayed after receiving this event
            if (_elements.cast) {
                if (utils.canCast()) {
                    utils.addClass(_elements.cast, 'jwcancast');
                } else {
                    utils.removeClass(_elements.cast, 'jwcancast');
                }
            }

            _castSession(evt || _castState);
        }

        function _castSession(evt) {
            _castState = evt;

            _toggleButton('cast', evt.active);

            _redraw();
        }

        // Bit of a hacky way to determine if the playlist is available
        function _sidebarShowing() {
            return (!!document.querySelector('#' + _api.id + ' .jwplaylist') && !_api.jwGetFullscreen());
        }

        /**
         * Styles specific to this controlbar/skin
         */
        function _createStyles() {
            _settings = utils.extend({}, _defaults, _skin.getComponentSettings('controlbar'), _config);

            _bgHeight = _getSkinElement('background').height;

            var margin = _audioMode ? 0 : _settings.margin;
            var styles = {
                height: _bgHeight,
                bottom: margin,
                left: margin,
                right: margin,
                'max-width': _audioMode ? '' : _settings.maxwidth
            };
            _css.style(_controlbar, styles);

            _css(_internalSelector('.jwtext'), {
                font: _settings.fontsize + 'px/' + _getSkinElement('background').height + 'px ' + _settings.font,
                color: _settings.fontcolor,
                'font-weight': _settings.fontweight
            });

            _css(_internalSelector('.jwoverlay'), {
                bottom: _bgHeight
            });
        }


        function _internalSelector(name) {
            return '#' + _id + (name ? ' ' + name : '');
        }

        function _createSpan() {
            return _createElement('span');
        }

        function _createElement(tagname) {
            return document.createElement(tagname);
        }

        function _buildControlbar() {
            var capLeft = _buildImage('capLeft');
            var capRight = _buildImage('capRight');
            var bg = _buildImage('background', {
                position: 'absolute',
                left: _getSkinElement('capLeft').width,
                right: _getSkinElement('capRight').width,
                'background-repeat': 'repeat-x'
            }, true);

            if (bg) {
                _appendChild(_controlbar, bg);
            }
            if (capLeft) {
                _appendChild(_controlbar, capLeft);
            }
            _buildLayout();
            if (capRight) {
                _appendChild(_controlbar, capRight);
            }
        }

        function _buildElement(element, pos) {
            switch (element.type) {
                case CB_TEXT:
                    return _buildText(element.name);
                case CB_BUTTON:
                    if (element.name !== 'blank') {
                        return _buildButton(element.name, pos);
                    }
                    break;
                case CB_SLIDER:
                    return _buildSlider(element.name);
            }
        }

        /*jshint maxparams:5*/
        function _buildImage(name, style, stretch, nocenter, vertical) {
            var element = _createSpan(),
                skinElem = _getSkinElement(name),
                center = nocenter ? ' left center' : ' center',
                size = _elementSize(skinElem),
                newStyle;

            element.className = 'jw' + name;
            element.innerHTML = '&nbsp;';

            if (!skinElem || !skinElem.src) {
                return;
            }

            if (stretch) {
                newStyle = {
                    background: 'url("' + skinElem.src + '") repeat-x ' + center,
                    'background-size': size,
                    height: vertical ? skinElem.height : ''
                };
            } else {
                newStyle = {
                    background: 'url("' + skinElem.src + '") no-repeat' + center,
                    'background-size': size,
                    width: skinElem.width,
                    height: vertical ? skinElem.height : ''
                };
            }
            element.skin = skinElem;
            _css(_internalSelector((vertical ? '.jwvertical ' : '') + '.jw' + name), utils.extend(newStyle, style));
            _elements[name] = element;
            return element;
        }

        function _buildButton(name, pos) {
            if (!_getSkinElement(name + 'Button').src) {
                return null;
            }

            // Don't show volume or mute controls on mobile, since it's not possible to modify audio levels in JS
            if (_isMobile && (name === 'mute' || name.indexOf('volume') === 0)) {
                return null;
            }
            // Having issues with stock (non-chrome) Android browser and showing overlays.
            //  Just remove HD/CC buttons in that case
            if (_nonChromeAndroid && /hd|cc/.test(name)) {
                return null;
            }


            var element = _createSpan();
            var span = _createSpan();
            var divider = _buildDivider(_dividerElement);
            var button = _createElement('button');
            element.className = 'jw' + name;
            if (pos === 'left') {
                _appendChild(element, span);
                _appendChild(element, divider);
            } else {
                _appendChild(element, divider);
                _appendChild(element, span);
            }

            if (!_isMobile) {
                button.addEventListener('click', _buttonClickHandler(name), false);
            } else if (name !== 'hd' && name !== 'cc') {
                var buttonTouch = new utils.touch(button);
                buttonTouch.addEventListener(utils.touchEvents.TAP, _buttonClickHandler(name));
            }

            button.innerHTML = '&nbsp;';
            button.tabIndex = -1;
            //fix for postbacks on mobile devices when a <form> is used
            button.setAttribute('type', 'button');
            _appendChild(span, button);

            var outSkin = _getSkinElement(name + 'Button'),
                overSkin = _getSkinElement(name + 'ButtonOver'),
                offSkin = _getSkinElement(name + 'ButtonOff');


            _buttonStyle(_internalSelector('.jw' + name + ' button'), outSkin, overSkin, offSkin);
            var toggle = _toggles[name];
            if (toggle) {
                _buttonStyle(_internalSelector('.jw' + name + '.jwtoggle button'), _getSkinElement(toggle + 'Button'),
                    _getSkinElement(toggle + 'ButtonOver'));
            }

            if (_toggleStates[name]) {
                utils.addClass(element, 'jwtoggle');
            } else {
                utils.removeClass(element, 'jwtoggle');
            }

            _elements[name] = element;

            return element;
        }

        function _buttonStyle(selector, out, over, off) {
            if (!out || !out.src) {
                return;
            }

            _css(selector, {
                width: out.width,
                background: 'url(' + out.src + ') no-repeat center',
                'background-size': _elementSize(out)
            });

            if (over.src && !_isMobile) {
                _css(selector + ':hover,' + selector + '.off:hover', {
                    background: 'url(' + over.src + ') no-repeat center',
                    'background-size': _elementSize(over)
                });
            }

            if (off && off.src) {
                _css(selector + '.off', {
                    background: 'url(' + off.src + ') no-repeat center',
                    'background-size': _elementSize(off)
                });
            }
        }

        function _buttonClickHandler(name) {
            return function(evt) {
                if (_buttonMapping[name]) {
                    _buttonMapping[name]();
                    if (_isMobile) {
                        _this.sendEvent(events.JWPLAYER_USER_ACTION);
                    }
                }
                if (evt.preventDefault) {
                    evt.preventDefault();
                }
            };
        }


        function _play() {
            if (_toggleStates.play) {
                _api.jwPause();
            } else {
                _api.jwPlay();
            }
        }

        function _mute() {
            var muted = !_toggleStates.mute;
            _api.jwSetMute(muted);
            if (!muted && _currentVolume === 0) {
                _api.jwSetVolume(20);
            }
            _volumeHandler();
        }

        function _hideOverlays(exception) {
            utils.foreach(_overlays, function(i, overlay) {
                if (i !== exception) {
                    if (i === 'cc') {
                        _clearCcTapTimeout();
                    }
                    if (i === 'hd') {
                        _clearHdTapTimeout();
                    }
                    overlay.hide();
                }
            });
        }

        function _toggleTimesDisplay(state) {
            if (!_controlbar || !_elements.alt) {
                return;
            }

            if (state === undefined) {
                state = (_controlbar.parentNode && _controlbar.parentNode.clientWidth >= 320);
            }

            if (state && !_instreamMode) {
                _css.style(_jwhidden, NOT_HIDDEN);
            } else {
                _css.style(_jwhidden, HIDDEN);
            }
        }

        function _showVolume() {
            if (_audioMode || _instreamMode) {
                return;
            }
            _css.block(_id); // unblock on position overlay
            _volumeOverlay.show();
            _positionOverlay('volume', _volumeOverlay);
            _hideOverlays('volume');
        }

        function _volume(pct) {
            _setVolume(pct);
            if (pct < 0.1) {
                pct = 0;
            }
            if (pct > 0.9) {
                pct = 1;
            }
            _api.jwSetVolume(pct * 100);
        }

        function _seek(pct) {
            var position;
            if (_activeCue) {
                pct = _activeCue.position;
                if (pct.toString().slice(-1) === '%') {
                    // percent string
                    position = _duration * parseFloat(pct.slice(0, -1)) / 100;
                } else {
                    // time value
                    position = parseFloat(pct);
                }
            } else {
                position = pct * _duration;
            }
            _api.jwSeek(position);
        }

        function _fullscreen() {
            _api.jwSetFullscreen();
        }

        function _next() {
            _api.jwPlaylistNext();
        }

        function _prev() {
            _api.jwPlaylistPrev();
        }

        function _toggleButton(name, state) {
            if (!_.isBoolean(state)) {
                state = !_toggleStates[name];
            }

            if (_elements[name]) {
                if (state) {
                    utils.addClass(_elements[name], 'jwtoggle');
                } else {
                    utils.removeClass(_elements[name], 'jwtoggle');
                }

                // Use the jwtoggling class to temporarily disable the animation
                utils.addClass(_elements[name], 'jwtoggling');
                setTimeout(function() {
                    utils.removeClass(_elements[name], 'jwtoggling');
                }, 100);
            }
            _toggleStates[name] = state;
        }

        function _buildText(name) {
            var style = {},
                skinName = (name === 'alt') ? 'elapsed' : name,
                skinElement = _getSkinElement(skinName + 'Background');
            if (skinElement.src) {
                var element = _createSpan();
                element.id = _createElementId(_id, name);
                if (name === 'elapsed' || name === 'duration') {
                    element.className = 'jwtext jw' + name + ' jwhidden';
                    _jwhidden.push(element);
                } else {
                    element.className = 'jwtext jw' + name;
                }
                style.background = 'url(' + skinElement.src + ') repeat-x center';
                style['background-size'] = _elementSize(_getSkinElement('background'));
                _css.style(element, style);
                element.innerHTML = (name !== 'alt') ? '00:00' : '';

                _elements[name] = element;
                return element;
            }
            return null;
        }

        function _buildDivider(divider) {
            var element = _buildImage(divider.name);
            if (!element) {
                element = _createSpan();
                element.className = 'jwblankDivider';
            }
            if (divider.className) {
                element.className += ' ' + divider.className;
            }
            return element;
        }

        function _showHd() {
            if (_levels.length > 2) {
                if (_hdTimer) {
                    clearTimeout(_hdTimer);
                    _hdTimer = undefined;
                }
                _css.block(_id); // unblock on position overlay
                _hdOverlay.show();
                _positionOverlay('hd', _hdOverlay);
                _hideOverlays('hd');
            }
        }

        function _showCc() {
            if (_captions && _captions.length > 2) {
                if (_ccTimer) {
                    clearTimeout(_ccTimer);
                    _ccTimer = undefined;
                }
                _css.block(_id); // unblock on position overlay
                _ccOverlay.show();
                _positionOverlay('cc', _ccOverlay);
                _hideOverlays('cc');
            }
        }

        function _switchLevel(newlevel) {
            if (newlevel >= 0 && newlevel < _levels.length) {
                _api.jwSetCurrentQuality(newlevel);
                _clearHdTapTimeout();
                _hdOverlay.hide();
            }
        }

        function _switchCaption(newcaption) {
            if (newcaption >= 0 && newcaption < _captions.length) {
                _api.jwSetCurrentCaptions(newcaption);
                _clearCcTapTimeout();
                _ccOverlay.hide();
            }
        }

        function _cc() {
            if (_captions.length !== 2) {
                return;
            }
            _switchCaption((_currentCaptions + 1) % 2);
        }

        function _hd() {
            if (_levels.length !== 2) {
                return;
            }
            _switchLevel((_currentQuality + 1) % 2);
        }

        function _cast() {
            if (_castState.active) {
                _api.jwOpenExtension();
            } else {
                _api.jwStartCasting();
            }
        }

        function _buildSlider(name) {
            if (_isMobile && name.indexOf('volume') === 0) {
                return;
            }

            var slider = _createSpan(),
                vertical = name === 'volume',
                skinPrefix = name + (name === 'time' ? 'Slider' : ''),
                capPrefix = skinPrefix + 'Cap',
                left = vertical ? 'Top' : 'Left',
                right = vertical ? 'Bottom' : 'Right',
                capLeft = _buildImage(capPrefix + left, null, false, false, vertical),
                capRight = _buildImage(capPrefix + right, null, false, false, vertical),
                rail = _buildSliderRail(name, vertical, left, right),
                capLeftSkin = _getSkinElement(capPrefix + left),
                capRightSkin = _getSkinElement(capPrefix + left);
            //railSkin = _getSkinElement(name+'SliderRail');

            slider.className = 'jwslider jw' + name;

            if (capLeft) {
                _appendChild(slider, capLeft);
            }
            _appendChild(slider, rail);
            if (capRight) {
                if (vertical) {
                    capRight.className += ' jwcapBottom';
                }
                _appendChild(slider, capRight);
            }

            _css(_internalSelector('.jw' + name + ' .jwrail'), {
                left: vertical ? '' : capLeftSkin.width,
                right: vertical ? '' : capRightSkin.width,
                top: vertical ? capLeftSkin.height : '',
                bottom: vertical ? capRightSkin.height : '',
                width: vertical ? '100%' : '',
                height: vertical ? 'auto' : ''
            });

            _elements[name] = slider;
            slider.vertical = vertical;

            if (name === 'time') {
                _timeOverlay = new html5.overlay(_id + '_timetooltip', _skin);
                _timeOverlayThumb = new html5.thumbs(_id + '_thumb');
                _timeOverlayText = _createElement('div');
                _timeOverlayText.className = 'jwoverlaytext';
                _timeOverlayContainer = _createElement('div');
                _appendChild(_timeOverlayContainer, _timeOverlayThumb.element());
                _appendChild(_timeOverlayContainer, _timeOverlayText);
                _timeOverlay.setContents(_timeOverlayContainer);
                _timeRail = rail;
                _setTimeOverlay(0);
                _appendChild(rail, _timeOverlay.element());
                _styleTimeSlider(slider);
                _setProgress(0);
                _setBuffer(0);
            } else if (name.indexOf('volume') === 0) {
                _styleVolumeSlider(slider, vertical, left, right);
            }

            return slider;
        }

        function _buildSliderRail(name, vertical, left, right) {
            var rail = _createSpan(),
                railElements = ['Rail', 'Buffer', 'Progress'],
                progressRail,
                sliderPrefix;

            rail.className = 'jwrail';

            for (var i = 0; i < railElements.length; i++) {
                sliderPrefix = (name === 'time' ? 'Slider' : '');
                var prefix = name + sliderPrefix + railElements[i],
                    element = _buildImage(prefix, null, !vertical, (name.indexOf('volume') === 0), vertical),
                    capLeft = _buildImage(prefix + 'Cap' + left, null, false, false, vertical),
                    capRight = _buildImage(prefix + 'Cap' + right, null, false, false, vertical),
                    capLeftSkin = _getSkinElement(prefix + 'Cap' + left),
                    capRightSkin = _getSkinElement(prefix + 'Cap' + right);

                if (element) {
                    var railElement = _createSpan();
                    railElement.className = 'jwrailgroup ' + railElements[i];
                    if (capLeft) {
                        _appendChild(railElement, capLeft);
                    }
                    _appendChild(railElement, element);
                    if (capRight) {
                        _appendChild(railElement, capRight);
                        capRight.className += ' jwcap' + (vertical ? 'Bottom' : 'Right');
                    }

                    _css(_internalSelector('.jwrailgroup.' + railElements[i]), {
                        'min-width': (vertical ? '' : capLeftSkin.width + capRightSkin.width)
                    });
                    railElement.capSize = vertical ? capLeftSkin.height + capRightSkin.height :
                        capLeftSkin.width + capRightSkin.width;

                    _css(_internalSelector('.' + element.className), {
                        left: vertical ? '' : capLeftSkin.width,
                        right: vertical ? '' : capRightSkin.width,
                        top: vertical ? capLeftSkin.height : '',
                        bottom: vertical ? capRightSkin.height : '',
                        height: vertical ? 'auto' : ''
                    });

                    if (i === 2) {
                        progressRail = railElement;
                    }

                    if (i === 2 && !vertical) {
                        var progressContainer = _createSpan();
                        progressContainer.className = 'jwprogressOverflow';
                        _appendChild(progressContainer, railElement);
                        _elements[prefix] = progressContainer;
                        _appendChild(rail, progressContainer);
                    } else {
                        _elements[prefix] = railElement;
                        _appendChild(rail, railElement);
                    }
                }
            }

            var thumb = _buildImage(name + sliderPrefix + 'Thumb', null, false, false, vertical);
            if (thumb) {
                _css(_internalSelector('.' + thumb.className), {
                    opacity: name === 'time' ? 0 : 1,
                    'margin-top': vertical ? thumb.skin.height / -2 : ''
                });

                thumb.className += ' jwthumb';
                _appendChild(vertical && progressRail ? progressRail : rail, thumb);
            }

            if (!_isMobile) {
                var sliderName = name;
                if (sliderName === 'volume' && !vertical) {
                    sliderName += 'H';
                }
                rail.addEventListener('mousedown', _sliderMouseDown(sliderName), false);
            } else {
                var railTouch = new utils.touch(rail);
                railTouch.addEventListener(utils.touchEvents.DRAG_START, _sliderDragStart);
                railTouch.addEventListener(utils.touchEvents.DRAG, _sliderDragEvent);
                railTouch.addEventListener(utils.touchEvents.DRAG_END, _sliderDragEvent);
                railTouch.addEventListener(utils.touchEvents.TAP, _sliderTapEvent);
            }

            if (name === 'time' && !_isMobile) {
                rail.addEventListener('mousemove', _showTimeTooltip, false);
                rail.addEventListener('mouseout', _hideTimeTooltip, false);
            }

            _elements[name + 'Rail'] = rail;

            return rail;
        }

        function _idle() {
            var currentState = _api.jwGetState();
            return (currentState === states.IDLE);
        }

        function _killSelect(evt) {
            evt.preventDefault();
            document.onselectstart = function() {
                return false;
            };
        }

        function _draggingStart(name) {
            _draggingEnd();
            _dragging = name;
            window.addEventListener('mouseup', _sliderMouseEvent, false);
            window.addEventListener('mousemove', _sliderMouseEvent, false);
        }

        function _draggingEnd() {
            window.removeEventListener('mouseup', _sliderMouseEvent);
            window.removeEventListener('mousemove', _sliderMouseEvent);
            _dragging = null;
        }

        function _sliderDragStart() {
            _elements.timeRail.className = 'jwrail';
            if (!_idle()) {
                _api.jwSeekDrag(true);
                _draggingStart('time');
                _showTimeTooltip();
                _this.sendEvent(events.JWPLAYER_USER_ACTION);
            }
        }

        function _sliderDragEvent(evt) {
            if (!_dragging) {
                return;
            }
            var rail = _elements[_dragging].querySelector('.jwrail'),
                railRect = utils.bounds(rail),
                pct = evt.x / railRect.width;
            if (pct > 100) {
                pct = 100;
            }
            if (evt.type === utils.touchEvents.DRAG_END) {
                _api.jwSeekDrag(false);
                _elements.timeRail.className = 'jwrail';
                _draggingEnd();
                _sliderMapping.time(pct);
                _hideTimeTooltip();
                _this.sendEvent(events.JWPLAYER_USER_ACTION);
            } else {
                _setProgress(pct);
                var currentTime = (new Date()).getTime();
                if (currentTime - _lastSeekTime > 500) {
                    _lastSeekTime = currentTime;
                    _sliderMapping.time(pct);
                }
                _this.sendEvent(events.JWPLAYER_USER_ACTION);
            }
        }

        function _sliderTapEvent(evt) {
            var rail = _elements.time.querySelector('.jwrail'),
                railRect = utils.bounds(rail),
                pct = evt.x / railRect.width;
            if (pct > 100) {
                pct = 100;
            }
            if (!_idle()) {
                _sliderMapping.time(pct);
                _this.sendEvent(events.JWPLAYER_USER_ACTION);
            }
        }

        function _sliderMouseDown(name) {
            return function(evt) {
                if (evt.button) {
                    return;
                }

                _elements[name + 'Rail'].className = 'jwrail';

                if (name === 'time') {
                    if (!_idle()) {
                        _api.jwSeekDrag(true);
                        _draggingStart(name);
                    }
                } else {
                    _draggingStart(name);
                }
            };
        }

        function _sliderMouseEvent(evt) {
            if (!_dragging || evt.button) {
                return;
            }
            var rail = _elements[_dragging].querySelector('.jwrail'),
                railRect = utils.bounds(rail),
                name = _dragging,
                pct;

            if (_iFramedFullscreenIE()) {
                pct = _elements[name].vertical ? ((railRect.bottom * 100 - evt.pageY) / (railRect.height * 100)) :
                ((evt.pageX - (railRect.left * 100)) / (railRect.width * 100));
            } else {
                pct = _elements[name].vertical ? ((railRect.bottom - evt.pageY) / railRect.height) :
                ((evt.pageX - railRect.left) / railRect.width);
            }
            if (evt.type === 'mouseup') {
                if (name === 'time') {
                    _api.jwSeekDrag(false);
                }

                _elements[name + 'Rail'].className = 'jwrail';
                _draggingEnd();
                _sliderMapping[name.replace('H', '')](pct);
            } else {
                if (_dragging === 'time') {
                    _setProgress(pct);
                } else {
                    _setVolume(pct);
                }
                var currentTime = (new Date()).getTime();
                if (currentTime - _lastSeekTime > 500) {
                    _lastSeekTime = currentTime;
                    _sliderMapping[_dragging.replace('H', '')](pct);
                }
            }
            return false;
        }

        function _showTimeTooltip(evt) {
            if (evt) {
                _positionTimeTooltip.apply(this, arguments);
            }

            if (_timeOverlay && _duration && !_audioMode && !_isMobile) {
                _css.block(_id); // unblock on position overlay
                _timeOverlay.show();
                _positionOverlay('time', _timeOverlay);
            }
        }

        function _hideTimeTooltip() {
            if (_timeOverlay) {
                _timeOverlay.hide();
            }
        }

        function _positionTimeTooltip(evt) {
            _cbBounds = utils.bounds(_controlbar);
            _railBounds = utils.bounds(_timeRail);

            if (!_railBounds || _railBounds.width === 0) {
                return;
            }

            var position,
                width;
            if (_iFramedFullscreenIE()) {
                position = (evt.pageX ? (evt.pageX - _railBounds.left*100) : evt.x);
                width = _railBounds.width *100;
            } else {
                position = (evt.pageX ? (evt.pageX - _railBounds.left) : evt.x);
                width = _railBounds.width;
            }

            _timeOverlay.positionX(Math.round(position));
            _setTimeOverlay(_duration * position / width);
        }

        var _setTimeOverlay = (function() {
            var lastText;

            var thumbLoadedCallback = function(width) {
                _css.style(_timeOverlay.element(), {
                    'width': width
                });
                _positionOverlay('time', _timeOverlay);
            };

            return function(sec) {
                var thumbUrl = _timeOverlayThumb.updateTimeline(sec, thumbLoadedCallback);

                var text;
                if (_activeCue) {
                    text = _activeCue.text;
                    if (text && (text !== lastText)) {
                        lastText = text;
                        _css.style(_timeOverlay.element(), {
                            'width': (text.length > 32) ? 160 : ''
                        });
                    }
                } else {
                    text = utils.timeFormat(sec);
                    if (!thumbUrl) {
                        _css.style(_timeOverlay.element(), {
                            'width': ''
                        });
                    }
                }
                if (_timeOverlayText.innerHTML !== text) {
                    _timeOverlayText.innerHTML = text;
                }
                _positionOverlay('time', _timeOverlay);
            };
        })();

        function _styleTimeSlider() {
            if (!_elements.timeSliderRail) {
                _css.style(_elements.time, HIDDEN);
            }

            if (_elements.timeSliderThumb) {
                _css.style(_elements.timeSliderThumb, {
                    'margin-left': (_getSkinElement('timeSliderThumb').width / -2)
                });
            }

            var cueClass = 'timeSliderCue',
                cue = _getSkinElement(cueClass),
                cueStyle = {
                    'z-index': 1
                };

            if (cue && cue.src) {
                _buildImage(cueClass);
                cueStyle['margin-left'] = cue.width / -2;
            } else {
                cueStyle.display = 'none';
            }
            _css(_internalSelector('.jw' + cueClass), cueStyle);

            _setBuffer(0);
            _setProgress(0);
        }

        function _addCue(timePos, text) {
            // test digits or percent
            if (/^[\d\.]+%?$/.test(timePos.toString())) {
                var cueElem = _buildImage('timeSliderCue'),
                    rail = _elements.timeSliderRail,
                    cue = {
                        position: timePos,
                        text: text,
                        element: cueElem
                    };

                if (cueElem && rail) {
                    rail.appendChild(cueElem);
                    cueElem.addEventListener('mouseover', function() {
                        _activeCue = cue;
                    }, false);
                    cueElem.addEventListener('mouseout', function() {
                        _activeCue = null;
                    }, false);
                    _cues.push(cue);
                }

            }
            _drawCues();
        }

        function _drawCues() {
            utils.foreach(_cues, function(idx, cue) {
                var style = {};
                if (cue.position.toString().slice(-1) === '%') {
                    style.left = cue.position;
                } else {
                    if (_duration > 0) {
                        style.left = (100 * cue.position / _duration).toFixed(2) + '%';
                        style.display = null;
                    } else {
                        style.left = 0;
                        style.display = 'none';
                    }
                }
                _css.style(cue.element, style);
            });
        }

        function _removeCues() {
            var rail = _elements.timeSliderRail;
            utils.foreach(_cues, function(idx, cue) {
                rail.removeChild(cue.element);
            });
            _cues.length = 0;
        }

        _this.setText = function(text) {
            _css.block(_id); //unblock on redraw
            var jwalt = _elements.alt,
                jwtime = _elements.time;
            if (!_elements.timeSliderRail) {
                _css.style(jwtime, HIDDEN);
            } else {
                _css.style(jwtime, text ? HIDDEN : SHOWING);
            }
            if (jwalt) {
                _css.style(jwalt, text ? SHOWING : HIDDEN);
                jwalt.innerHTML = text || '';
            }
            _redraw();
        };

        function _styleVolumeSlider(slider, vertical, left, right) {
            var prefix = 'volume' + (vertical ? '' : 'H'),
                direction = vertical ? 'vertical' : 'horizontal';

            _css(_internalSelector('.jw' + prefix + '.jw' + direction), {
                width: _getSkinElement(prefix + 'Rail', vertical).width + (vertical ? 0 :
                    (_getSkinElement(prefix + 'Cap' + left).width +
                        _getSkinElement(prefix + 'RailCap' + left).width +
                        _getSkinElement(prefix + 'RailCap' + right).width +
                        _getSkinElement(prefix + 'Cap' + right).width)
                ),
                height: vertical ? (
                    _getSkinElement(prefix + 'Cap' + left).height +
                    _getSkinElement(prefix + 'Rail').height +
                    _getSkinElement(prefix + 'RailCap' + left).height +
                    _getSkinElement(prefix + 'RailCap' + right).height +
                    _getSkinElement(prefix + 'Cap' + right).height
                ) : ''
            });

            slider.className += ' jw' + direction;
        }

        var _groups = {};

        function _buildLayout() {
            _buildGroup('left');
            _buildGroup('center');
            _buildGroup('right');
            _appendChild(_controlbar, _groups.left);
            _appendChild(_controlbar, _groups.center);
            _appendChild(_controlbar, _groups.right);
            _buildOverlays();

            _css.style(_groups.right, {
                right: _getSkinElement('capRight').width
            });
        }

        function _buildOverlays() {
            if (_elements.hd) {
                _hdOverlay = new html5.menu('hd', _id + '_hd', _skin, _switchLevel);
                if (!_isMobile) {
                    _addOverlay(_hdOverlay, _elements.hd, _showHd, _setHdTimer);
                } else {
                    _addMobileOverlay(_hdOverlay, _elements.hd, _showHd, 'hd');
                }
                _overlays.hd = _hdOverlay;
            }
            if (_elements.cc) {
                _ccOverlay = new html5.menu('cc', _id + '_cc', _skin, _switchCaption);
                if (!_isMobile) {
                    _addOverlay(_ccOverlay, _elements.cc, _showCc, _setCcTimer);
                } else {
                    _addMobileOverlay(_ccOverlay, _elements.cc, _showCc, 'cc');
                }
                _overlays.cc = _ccOverlay;
            }
            if (_elements.mute && _elements.volume && _elements.volume.vertical) {
                _volumeOverlay = new html5.overlay(_id + '_volumeoverlay', _skin);
                _volumeOverlay.setContents(_elements.volume);
                _addOverlay(_volumeOverlay, _elements.mute, _showVolume);
                _overlays.volume = _volumeOverlay;
            }
        }

        function _setCcTimer() {
            _ccTimer = setTimeout(_ccOverlay.hide, 500);
        }

        function _setHdTimer() {
            _hdTimer = setTimeout(_hdOverlay.hide, 500);
        }

        function _addOverlay(overlay, button, hoverAction, timer) {
            if (_isMobile) {
                return;
            }
            var element = overlay.element();
            _appendChild(button, element);
            button.addEventListener('mousemove', hoverAction, false);
            if (timer) {
                button.addEventListener('mouseout', timer, false);
            } else {
                button.addEventListener('mouseout', overlay.hide, false);
            }
            _css.style(element, {
                left: '50%'
            });
        }

        function _addMobileOverlay(overlay, button, tapAction, name) {
            if (!_isMobile) {
                return;
            }
            var element = overlay.element();
            _appendChild(button, element);
            var buttonTouch = new utils.touch(button);
            buttonTouch.addEventListener(utils.touchEvents.TAP, function() {
                _overlayTapHandler(overlay, tapAction, name);
            });
        }

        function _overlayTapHandler(overlay, tapAction, name) {
            if (name === 'cc') {
                if (_captions.length === 2) {
                    tapAction = _cc;
                }
                if (_ccTapTimer) {
                    _clearCcTapTimeout();
                    overlay.hide();
                } else {
                    _ccTapTimer = setTimeout(function() {
                        overlay.hide();
                        _ccTapTimer = undefined;
                    }, 4000);
                    tapAction();
                }
                _this.sendEvent(events.JWPLAYER_USER_ACTION);
            } else if (name === 'hd') {
                if (_levels.length === 2) {
                    tapAction = _hd;
                }
                if (_hdTapTimer) {
                    _clearHdTapTimeout();
                    overlay.hide();
                } else {
                    // TODO:: _.throttle
                    _hdTapTimer = setTimeout(function() {
                        overlay.hide();
                        _hdTapTimer = undefined;
                    }, 4000);
                    tapAction();
                }
                _this.sendEvent(events.JWPLAYER_USER_ACTION);
            }
        }

        function _buildGroup(pos) {
            var elem = _createSpan();
            elem.className = 'jwgroup jw' + pos;
            _groups[pos] = elem;
            if (_layout[pos]) {
                _buildElements(_layout[pos], _groups[pos], pos);
            }
        }

        function _buildElements(group, container, pos) {
            if (group && group.elements.length > 0) {
                for (var i = 0; i < group.elements.length; i++) {
                    var element = _buildElement(group.elements[i], pos);
                    if (element) {
                        if (group.elements[i].name === 'volume' && element.vertical) {
                            _volumeOverlay = new html5.overlay(_id + '_volumeOverlay', _skin);
                            _volumeOverlay.setContents(element);
                        } else {
                            _appendChild(container, element);
                        }
                    }
                }
            }
        }

        function _iFramedFullscreenIE() {
            return (_iFramed && utils.isIE() && _api.jwGetFullscreen());
        }

        function _redraw() {
            clearTimeout(_redrawTimeout);
            _redrawTimeout = setTimeout(_this.redraw, 0);
        }

        _this.redraw = function(resize) {
            _css.block(_id);

            if (resize && _this.visible) {
                _this.show(true);
            }
            _createStyles();

            // ie <= IE10 does not allow fullscreen from inside an iframe. Hide the FS button.
            var ieIframe = _iFramed && utils.isMSIE();
            var casting = _castState.active;
            _css.style(_elements.fullscreen, {
                display: (_audioMode || casting || _hideFullscreen || ieIframe) ? 'none' : ''
            });

            // TODO: hide these all by default (global styles at bottom), and update using classes when model changes:
            // jwinstream, jwaudio, jwhas-hd, jwhas-cc (see jwcancast)
            _css.style(_elements.volumeH, {
                display: _audioMode || _instreamMode ? 'block' : 'none'
            });
            var maxWidth = Math.floor(_settings.maxwidth);
            if (maxWidth) {
                if (_controlbar.parentNode && utils.isIE()) {
                    if (!_audioMode &&
                        _controlbar.parentNode.clientWidth > maxWidth + (Math.floor(_settings.margin) * 2)) {
                        _css.style(_controlbar, {
                            width: maxWidth
                        });
                    } else {
                        _css.style(_controlbar, {
                            width: ''
                        });
                    }
                }
            }

            if (_volumeOverlay) {
                _css.style(_volumeOverlay.element(), {
                    display: !(_audioMode || _instreamMode) ? 'block' : 'none'
                });
            }
            _css.style(_elements.hd, {
                display: !_audioMode && !casting && _hasHD() ? '' : 'none'
            });
            _css.style(_elements.cc, {
                display: !_audioMode && _hasCaptions() ? '' : 'none'
            });



            _drawCues();

            // utils.foreach(_overlays, _positionOverlay);

            _css.unblock(_id);

            if (_this.visible) {
                var capLeft  = _getSkinElement('capLeft'),
                    capRight = _getSkinElement('capRight'),
                    centerCss;
                if (_iFramedFullscreenIE()) {
                    centerCss = {
                        left: Math.round(utils.parseDimension(_groups.left.offsetWidth*62) + capLeft.width),
                        right: Math.round(utils.parseDimension(_groups.right.offsetWidth*86) + capRight.width)
                    };
                } else {
                    centerCss = {
                        left: Math.round(utils.parseDimension(_groups.left.offsetWidth) + capLeft.width),
                        right: Math.round(utils.parseDimension(_groups.right.offsetWidth) + capRight.width)
                    };
                }
                _css.style(_groups.center, centerCss);
            }
        };

        function _updateNextPrev() {
            if (!_adMode && _api.jwGetPlaylist().length > 1 && !_sidebarShowing()) {
                _css.style(_elements.next, NOT_HIDDEN);
                _css.style(_elements.prev, NOT_HIDDEN);
            } else {
                _css.style(_elements.next, HIDDEN);
                _css.style(_elements.prev, HIDDEN);
            }
        }

        function _positionOverlay(name, overlay) {
            if (!_cbBounds) {
                _cbBounds = utils.bounds(_controlbar);
            }
            var forceRedraw = true;
            overlay.constrainX(_cbBounds, forceRedraw);
        }


        _this.audioMode = function(mode) {
            if (mode !== undefined && mode !== _audioMode) {
                _audioMode = !!mode;
                _redraw();
            }
            return _audioMode;
        };

        _this.instreamMode = function(mode) {
            if (mode !== undefined && mode !== _instreamMode) {
                _instreamMode = !!mode;
                // TODO: redraw

                // instreamMode is when we add a second cbar overtop the original
                _css.style(_elements.cast, _instreamMode ? HIDDEN : NOT_HIDDEN);
            }
            return _instreamMode;
        };

        _this.adMode = function(mode) {
            if (_.isBoolean(mode) && mode !== _adMode) {
                _adMode = mode;

                if (mode) {
                    _removeFromArray(_jwhidden, _elements.elapsed);
                    _removeFromArray(_jwhidden, _elements.duration);
                } else {
                    _addOnceToArray(_jwhidden, _elements.elapsed);
                    _addOnceToArray(_jwhidden, _elements.duration);
                }

                _css.style([
                    _elements.cast,
                    _elements.elapsed,
                    _elements.duration
                ], mode ? HIDDEN : NOT_HIDDEN);

                _updateNextPrev();
            }

            return _adMode;
        };

        /** Whether or not to show the fullscreen icon - used when an audio file is played **/
        _this.hideFullscreen = function(mode) {
            if (mode !== undefined && mode !== _hideFullscreen) {
                _hideFullscreen = !!mode;
                _redraw();
            }
            return _hideFullscreen;
        };

        _this.element = function() {
            return _controlbar;
        };

        _this.margin = function() {
            return parseInt(_settings.margin, 10);
        };

        _this.height = function() {
            return _bgHeight;
        };


        function _setBuffer(pct) {
            if (_elements.timeSliderBuffer) {
                pct = Math.min(Math.max(0, pct), 1);
                _css.style(_elements.timeSliderBuffer, {
                    width: (pct * 100).toFixed(1) + '%',
                    opacity: pct > 0 ? 1 : 0
                });
            }
        }

        function _sliderPercent(name, pct) {
            if (!_elements[name]) {
                return;
            }
            var vertical = _elements[name].vertical,
                prefix = name + (name === 'time' ? 'Slider' : ''),
                size = 100 * Math.min(Math.max(0, pct), 1) + '%',
                progress = _elements[prefix + 'Progress'],
                thumb = _elements[prefix + 'Thumb'],
                style;

            if (progress) {
                style = {};
                if (vertical) {
                    style.height = size;
                    style.bottom = 0;
                } else {
                    style.width = size;
                }
                if (name !== 'volume') {
                    style.opacity = (pct > 0 || _dragging) ? 1 : 0;
                }
                _css.style(progress, style);
            }

            if (thumb) {
                style = {};
                if (vertical) {
                    style.top = 0;
                } else {
                    style.left = size;
                }
                _css.style(thumb, style);
            }
        }

        function _setVolume(pct) {
            _sliderPercent('volume', pct);
            _sliderPercent('volumeH', pct);
        }

        function _setProgress(pct) {
            _sliderPercent('time', pct);
        }

        function _getSkinElement(name) {
            var component = 'controlbar',
                elem, newname = name;
            if (name.indexOf('volume') === 0) {
                if (name.indexOf('volumeH') === 0) {
                    newname = name.replace('volumeH', 'volume');
                } else {
                    component = 'tooltip';
                }
            }
            elem = _skin.getSkinElement(component, newname);
            if (elem) {
                return elem;
            } else {
                return {
                    width: 0,
                    height: 0,
                    src: '',
                    image: undefined,
                    ready: false
                };
            }
        }

        function _appendChild(parent, child) {
            parent.appendChild(child);
        }


        //because of size impacting whether to show duration/elapsed time,
        // optional resize argument overrides the this.visible return clause.
        _this.show = function(resize) {
            if (_this.visible && !resize) {
                return;
            }
            _this.visible = true;

            var style = {
                display: 'inline-block'
            };

            _css.style(_controlbar, style);
            _cbBounds = utils.bounds(_controlbar);

            _toggleTimesDisplay();

            _css.block(_id); //unblock on redraw

            _volumeHandler();
            _redraw();

            _clearHideTimeout();
            _hideTimeout = setTimeout(function() {
                _css.style(_controlbar, {
                    opacity: 1
                });
            }, 0);
        };

        _this.showTemp = function() {
            if (!this.visible) {
                _controlbar.style.opacity = 0;
                _controlbar.style.display = 'inline-block';
            }
        };

        _this.hideTemp = function() {
            if (!this.visible) {
                _controlbar.style.display = 'none';
            }
        };


        function _clearHideTimeout() {
            clearTimeout(_hideTimeout);
            _hideTimeout = -1;
        }

        function _clearCcTapTimeout() {
            clearTimeout(_ccTapTimer);
            _ccTapTimer = undefined;
        }

        function _clearHdTapTimeout() {
            clearTimeout(_hdTapTimer);
            _hdTapTimer = undefined;
        }

        function _loadCues(vttFile) {
            if (vttFile) {
                utils.ajax(vttFile, _cueLoaded, _cueFailed, true);
            } else {
                _cues.length = 0;
            }
        }

        function _cueLoaded(xmlEvent) {
            var data = new jwplayer.parsers.srt().parse(xmlEvent.responseText, true);
            if (!_.isArray(data)) {
                return _cueFailed('Invalid data');
            }
            _this.addCues(data);
        }

        _this.addCues = function(cues) {
            utils.foreach(cues, function(idx, elem) {
                if (elem.text) {
                    _addCue(elem.begin, elem.text);
                }
            });
        };

        function _cueFailed(error) {
            utils.log('Cues failed to load: ' + error);
        }

        _this.hide = function() {
            if (!_this.visible) {
                return;
            }
            // Don't hide for mobile ads if controls are enabled
            if (_instreamMode && _isMobile && _api.jwGetControls()) {
                return;
            }
            _this.visible = false;
            _css.style(_controlbar, {
                opacity: 0
            });
            _clearHideTimeout();
            _hideTimeout = setTimeout(function() {
                _css.style(_controlbar, {
                    display: 'none'
                });
            }, JW_VISIBILITY_TIMEOUT);
        };


        // Call constructor
        _init();

    };

    /***************************************************************************
     * Player stylesheets - done once on script initialization; * These CSS
     * rules are used for all JW Player instances *
     **************************************************************************/

    (function() {
        var JW_CSS_ABSOLUTE = 'absolute',
            JW_CSS_RELATIVE = 'relative',
            JW_CSS_SMOOTH_EASE = 'opacity .25s, background .25s, visibility .25s',
            CB_CLASS = 'span.jwcontrolbar';

        _css(CB_CLASS, {
            position: JW_CSS_ABSOLUTE,
            margin: 'auto',
            opacity: 0,
            display: 'none'
        });

        _css(CB_CLASS + ' span', {
            height: '100%'
        });
        utils.dragStyle(CB_CLASS + ' span', 'none');

        _css(CB_CLASS + ' .jwgroup', {
            display: 'inline'
        });

        _css(CB_CLASS + ' span, ' + CB_CLASS + ' .jwgroup button,' + CB_CLASS + ' .jwleft', {
            position: JW_CSS_RELATIVE,
            'float': 'left'
        });

        _css(CB_CLASS + ' .jwright', {
            position: JW_CSS_RELATIVE,
            'float': 'right'
        });

        _css(CB_CLASS + ' .jwcenter', {
            position: JW_CSS_ABSOLUTE
        });

        _css(CB_CLASS + ' button', {
            display: 'inline-block',
            height: '100%',
            border: 'none',
            cursor: 'pointer'
        });

        _css(CB_CLASS + ' .jwcapRight,' + CB_CLASS + ' .jwtimeSliderCapRight,' + CB_CLASS + ' .jwvolumeCapRight', {
            right: 0,
            position: JW_CSS_ABSOLUTE
        });

        _css(CB_CLASS + ' .jwcapBottom', {
            bottom: 0,
            position: JW_CSS_ABSOLUTE
        });

        _css(CB_CLASS + ' .jwtime', {
            position: JW_CSS_ABSOLUTE,
            height: '100%',
            width: '100%',
            left: 0
        });

        _css(CB_CLASS + ' .jwthumb', {
            position: JW_CSS_ABSOLUTE,
            height: '100%',
            cursor: 'pointer'
        });

        _css(CB_CLASS + ' .jwrail', {
            position: JW_CSS_ABSOLUTE,
            cursor: 'pointer'
        });

        _css(CB_CLASS + ' .jwrailgroup', {
            position: JW_CSS_ABSOLUTE,
            width: '100%'
        });

        _css(CB_CLASS + ' .jwrailgroup span', {
            position: JW_CSS_ABSOLUTE
        });

        _css(CB_CLASS + ' .jwdivider+.jwdivider', {
            display: 'none'
        });

        _css(CB_CLASS + ' .jwtext', {
            padding: '0 5px',
            'text-align': 'center'
        });

        _css(CB_CLASS + ' .jwcast', {
            display: 'none'
        });

        _css(CB_CLASS + ' .jwcast.jwcancast', {
            display: 'block'
        });

        _css(CB_CLASS + ' .jwalt', {
            display: 'none',
            overflow: 'hidden'
        });

        // important
        _css(CB_CLASS + ' .jwalt', {
            position: JW_CSS_ABSOLUTE,
            left: 0,
            right: 0,
            'text-align': 'left'
        }, true);

        _css(CB_CLASS + ' .jwoverlaytext', {
            padding: 3,
            'text-align': 'center'
        });

        _css(CB_CLASS + ' .jwvertical *', {
            display: 'block'
        });

        // important
        _css(CB_CLASS + ' .jwvertical .jwvolumeProgress', {
            height: 'auto'
        }, true);

        _css(CB_CLASS + ' .jwprogressOverflow', {
            position: JW_CSS_ABSOLUTE,
            overflow: 'hidden'
        });

        _setTransition(CB_CLASS, JW_CSS_SMOOTH_EASE);
        _setTransition(CB_CLASS + ' button', JW_CSS_SMOOTH_EASE);
        _setTransition(CB_CLASS + ' .jwtoggling', 'none');
    })();

})(window, document);
(function(jwplayer) {
    var html5 = jwplayer.html5,
        utils = jwplayer.utils,
        events = jwplayer.events,
        states = events.state,
        playlist = jwplayer.playlist;

    html5.controller = function(_model, _view) {
        var _ready = false,
            _loadOnPlay = -1,
            _preplay = false,
            _actionOnAttach,
            _stopPlaylist = false, // onComplete, should we play next item or not?
            _interruptPlay,
            _queuedCalls = [],
            _this = utils.extend(this, new events.eventdispatcher(_model.id, _model.config.debug));

        function _init() {
            _model.addEventListener(events.JWPLAYER_MEDIA_BUFFER_FULL, _bufferFullHandler);
            _model.addEventListener(events.JWPLAYER_MEDIA_COMPLETE, function() {
                // Insert a small delay here so that other complete handlers can execute
                setTimeout(_completeHandler, 25);
            });
            _model.addEventListener(events.JWPLAYER_MEDIA_ERROR, function(evt) {
                // Re-dispatch media errors as general error
                var evtClone = utils.extend({}, evt);
                evtClone.type = events.JWPLAYER_ERROR;
                _this.sendEvent(evtClone.type, evtClone);
            });
        }

        function _video() {
            return _model.getVideo();
        }

        function _playerReady(evt) {
            if (!_ready) {

                _view.completeSetup();
                _this.sendEvent(evt.type, evt);

                if (jwplayer.utils.exists(jwplayer.playerReady)) {
                    jwplayer.playerReady(evt);
                }

                _model.addGlobalListener(_forward);
                _view.addGlobalListener(_forward);

                _this.sendEvent(jwplayer.events.JWPLAYER_PLAYLIST_LOADED, {
                    playlist: jwplayer(_model.id).getPlaylist()
                });
                _this.sendEvent(jwplayer.events.JWPLAYER_PLAYLIST_ITEM, {
                    index: _model.item
                });

                _load();

                if (_model.autostart && !utils.isMobile()) {
                    _play();
                }

                _ready = true;

                while (_queuedCalls.length > 0) {
                    var queuedCall = _queuedCalls.shift();
                    _callMethod(queuedCall.method, queuedCall.arguments);
                }
            }
        }

        function _forward(evt) {
            _this.sendEvent(evt.type, evt);
        }

        function _bufferFullHandler() {
            _video().play();
        }

        function _load(item) {
            _stop(true);

            switch (utils.typeOf(item)) {
                case 'string':
                    _loadPlaylist(item);
                    break;
                case 'object':
                case 'array':
                    _model.setPlaylist(new jwplayer.playlist(item));
                    break;
                case 'number':
                    _model.setItem(item);
                    break;
            }
        }

        function _loadPlaylist(toLoad) {
            var loader = new playlist.loader();
            loader.addEventListener(events.JWPLAYER_PLAYLIST_LOADED, function(evt) {
                _load(evt.playlist);
            });
            loader.addEventListener(events.JWPLAYER_ERROR, function(evt) {
                _load([]);
                evt.message = 'Could not load playlist: ' + evt.message;
                _forward(evt);
            });
            loader.load(toLoad);
        }

        function _play(state) {
            if (!utils.exists(state)) {
                state = true;
            } else if (!state) {
                return _pause();
            }
            try {
                if (_loadOnPlay >= 0) {
                    _load(_loadOnPlay);
                    _loadOnPlay = -1;
                }
                //_actionOnAttach = _play;
                if (!_preplay) {
                    _preplay = true;
                    _this.sendEvent(events.JWPLAYER_MEDIA_BEFOREPLAY);
                    _preplay = false;
                    if (_interruptPlay) {
                        _interruptPlay = false;
                        _actionOnAttach = null;
                        return;
                    }
                }

                if (_isIdle()) {
                    if (_model.playlist.length === 0) {
                        return false;
                    }
                    _video().load(_model.playlist[_model.item]);
                } else if (_model.state === states.PAUSED) {
                    _video().play();
                }

                return true;
            } catch (err) {
                _this.sendEvent(events.JWPLAYER_ERROR, err);
                _actionOnAttach = null;
            }
            return false;
        }

        function _stop(internal) {
            _actionOnAttach = null;
            try {
                _video().stop();
                if (!internal) {
                    _stopPlaylist = true;
                }

                if (_preplay) {
                    _interruptPlay = true;
                }
                return true;
            } catch (err) {
                _this.sendEvent(events.JWPLAYER_ERROR, err);
            }
            return false;
        }

        function _pause(state) {
            _actionOnAttach = null;
            if (!utils.exists(state)) {
                state = true;
            } else if (!state) {
                return _play();
            }
            switch (_model.state) {
                case states.PLAYING:
                case states.BUFFERING:
                    try {
                        _video().pause();
                    } catch (err) {
                        _this.sendEvent(events.JWPLAYER_ERROR, err);
                        return false;
                    }
                    break;
                default:
                    if (_preplay) {
                        _interruptPlay = true;
                    }
            }
            return true;
        }

        function _isIdle() {
            return (_model.state === states.IDLE);
        }

        function _seek(pos) {
            if (_model.state !== states.PLAYING) {
                _play(true);
            }
            _video().seek(pos);
        }

        function _setFullscreen(state) {
            _view.fullscreen(state);
        }

        function _item(index) {
            utils.css.block(_model.id + '_next');
            _load(index);
            _play();
            utils.css.unblock(_model.id + '_next');
        }

        function _prev() {
            _item(_model.item - 1);
        }

        function _next() {
            _item(_model.item + 1);
        }

        function _completeHandler() {
            if (!_isIdle()) {
                // Something has made an API call before the complete handler has fired.
                return;
            } else if (_stopPlaylist) {
                // Stop called in onComplete event listener
                _stopPlaylist = false;
                return;
            }

            _actionOnAttach = _completeHandler;
            if (_model.repeat) {
                _next();
            } else {
                if (_model.item === _model.playlist.length - 1) {
                    _loadOnPlay = 0;
                    _stop(true);
                    setTimeout(function() {
                        _this.sendEvent(events.JWPLAYER_PLAYLIST_COMPLETE);
                    }, 0);
                } else {
                    _next();
                }
            }
        }

        function _setCurrentQuality(quality) {
            _video().setCurrentQuality(quality);
        }

        function _getCurrentQuality() {
            if (_video()) {
                return _video().getCurrentQuality();
            }
            return -1;
        }

        function _getQualityLevels() {
            if (_video()) {
                return _video().getQualityLevels();
            }
            return null;
        }
        
        function _setCurrentAudioTrack(index) {
            _video().setCurrentAudioTrack(index);
        }

        function _getCurrentAudioTrack() {
            if (_video()) {
                return _video().getCurrentAudioTrack();
            }
            return -1;
        }

        function _getAudioTracks() {
            if (_video()) {
                return _video().getAudioTracks();
            }
            return null;
        }
        function _setCurrentCaptions(caption) {
            _view.setCurrentCaptions(caption);
        }

        function _getCurrentCaptions() {
            return _view.getCurrentCaptions();
        }

        function _getCaptionsList() {
            return _view.getCaptionsList();
        }

        /** Used for the InStream API **/
        function _detachMedia() {
            try {
                return _model.getVideo().detachMedia();
            } catch (err) {
                utils.log('Error calling detachMedia', err);
            }
            return null;
        }

        function _attachMedia(seekable) {
            // Called after instream ends
            try {
                _model.getVideo().attachMedia(seekable);

            } catch (err) {
                utils.log('Error calling detachMedia', err);
                return;
            }
            if (typeof _actionOnAttach === 'function') {
                _actionOnAttach();
            }
        }

        function _waitForReady(func) {
            return function() {
                var args = Array.prototype.slice.call(arguments, 0);
                if (_ready) {
                    _callMethod(func, args);
                } else {
                    _queuedCalls.push({
                        method: func,
                        arguments: args
                    });
                }
            };
        }

        function _callMethod(func, args) {
            func.apply(this, args);
        }

        /** Controller API / public methods **/
        this.play = _waitForReady(_play);
        this.pause = _waitForReady(_pause);
        this.seek = _waitForReady(_seek);
        this.stop = function() {
            // Something has called stop() in an onComplete handler
            if (_isIdle()) {
                _stopPlaylist = true;
            }
            _waitForReady(_stop)();
        };
        this.load = _waitForReady(_load);
        this.next = _waitForReady(_next);
        this.prev = _waitForReady(_prev);
        this.item = _waitForReady(_item);
        this.setVolume = _waitForReady(_model.setVolume);
        this.setMute = _waitForReady(_model.setMute);
        this.setFullscreen = _waitForReady(_setFullscreen);
        this.detachMedia = _detachMedia;
        this.attachMedia = _attachMedia;
        this.setCurrentQuality = _waitForReady(_setCurrentQuality);
        this.getCurrentQuality = _getCurrentQuality;
        this.getQualityLevels = _getQualityLevels;
        this.setCurrentAudioTrack = _setCurrentAudioTrack;
        this.getCurrentAudioTrack = _getCurrentAudioTrack;
        this.getAudioTracks = _getAudioTracks;
        this.setCurrentCaptions = _waitForReady(_setCurrentCaptions);
        this.getCurrentCaptions = _getCurrentCaptions;
        this.getCaptionsList = _getCaptionsList;
        this.checkBeforePlay = function() {
            return _preplay;
        };
        this.playerReady = _playerReady;
        _init();
    };

})(jwplayer);
/*jshint maxlen:39500*/
(function(jwplayer) {

    // Note that the following line is auto-generated by the build process
    var text = '<?xml version="1.0" ?><skin author="JW Player" name="Six" target="6.7" version="3.0"><components><component name="controlbar"><settings><setting name="margin" value="10"/><setting name="maxwidth" value="800"/><setting name="fontsize" value="11"/><setting name="fontweight" value="normal"/><setting name="fontcase" value="normal"/><setting name="fontcolor" value="0xd2d2d2"/></settings><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAeCAYAAADtlXTHAAAANklEQVR4AWMUFRW/x2RiYqLI9O3bNwam////MzAxAAGcAImBWf9RuRAxnFyEUQgDCLKATLCDAFb+JfgLDLOxAAAAAElFTkSuQmCC"/><element name="capLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAeCAYAAAARgF8NAAAAr0lEQVR4AWNhAAJRUXEFIFUOxNZAzMOABFiAkkpAeh0fH5+IgoKCKBsQoCgA4lJeXl5ReXl5qb9//zJ8+/aNAV2Btbi4uOifP39gYhgKeFiBAEjjUAAFlCn4/5+gCf9pbwVhNwxhKxAm/KdDZA16E778/v37DwsLKwsuBUdfvXopISUlLYpLQc+vX78snz17yigqKibAAgQoCuTlFe4+fPggCKio9OnTJzZAMW5kBQAEFD9DdqDrQQAAAABJRU5ErkJggg=="/><element name="capRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAeCAYAAAARgF8NAAAArklEQVR4Ad2TMQrCQBBF/y5rYykEa++QxibRK3gr0dt4BPUSLiTbKMYUSlgt3IFxyogJsRHFB6/7/A+7jIqiYYZnvLgV56IzcRyPUOMuOOcGVVWNAcxUmk4ZNZRS0Fojz/O9936lkmTCaICIgrV2Z9CCMaYHoK/RQWfAMHcEAP7QxPsNAP/BBDN/+7N+uoEoEIBba0NRHM8A1i8vSUJZni4hhAOAZdPxXsWNuBCzB0E+V9jBVxF8AAAAAElFTkSuQmCC"/><element name="playButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAeCAQAAACcJxZuAAAAtElEQVR4AWOgLRgFnAyiDPwMzMRrkHuwuCSdQZ14Tbpv9v/cf2UN8ZoMHu5/uP/l/h9EazK4sx8Cn+7/RpQmg+v74RBo11eCmgwu7keFd/d/wavJ4PR+THhj/6f9N1ZODWTgxKLhyH7scMvK3iCsGvbtx4Tz1oZn4HTSjv2ocObakAy8nt60HwGnrA3KIBisa/dD4IS1/lDFBJLGiv0r9ves9YUpJpz4Ji72hiomNXnTH4wCAAxXpSnKMgKaAAAAAElFTkSuQmCC"/><element name="playButtonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAeCAQAAACcJxZuAAAAtElEQVR4AWOgLRgFPAwyDCIMLMRr0Hhws6SLwYR4TTZv/v/8f+UZ8ZocHv5/+P/l/x9Ea3K48x8Cn/7/RpQmh+v/4RBo11eCmhwu/keFd/9/wavJ4fR/THjj/6f/Nx5OzWHgwaLhyH/scMuj3lysGvb9x4Tznod343TSjv+ocObzkG68nt70HwGnPA/qJhisa/9D4ITn/lDFBJLGiv8r/vc894UpJpz4Jt7yhiomNXnTH4wCAHC8wQF60KqlAAAAAElFTkSuQmCC"/><element name="pauseButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAeCAQAAACcJxZuAAAAYElEQVR4AWOgNRgFPAwqDAZAqAJkofPhgBFJg8r/2VDBVIY7GHwoYEG24RmchcnHpoHhDxDj4WNq+I0m+ZvqGn6hSf6iuoafaJI/SbaB7hroHw9f/sBZ6HzSkzdtwSgAADNtJoABsotOAAAAAElFTkSuQmCC"/><element name="pauseButtonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAeCAQAAACcJxZuAAAAWklEQVR4AWOgNRgFAgwGDA5AaABkofOxAoP/UMBggMGHAxZkG57BWeh87BoY/gAxHj6mht9okr+pruEXmuQvqmv4iSb5k2Qb6K6B/vHw4Q+chc4nPXnTFowCADYgMi8+iyldAAAAAElFTkSuQmCC"/><element name="prevButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAeCAQAAACLBYanAAAAmElEQVR4AWMYMDAKeBgkgBgGmBn4GUQZONEVqfzfz6ACV6Bekv5gMYMcuiKDR/sZDGAKrqz5sf/lfgZdDEW39jPYQxR82/94/y0gZDDAUHR+f3rpjZWf99/efx4CsSk6sj+pbMvKI/vhEJuiXWDrQjNmr921HwyxKVoPd3hAxsS16/evx+JwleUoQeCbMRkRBIQDk/5gFAAAvD5I9xunLg8AAAAASUVORK5CYII="/><element name="prevButtonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAeCAQAAACLBYanAAAAmUlEQVR4AWMYMDAKBBgUgBgGWBhEGGQYeNAVGfz/z2AAV2BS0vXgJoMGuiKHR/8ZHGAKrjz78f/lfwYbDEW3/jOEQBR8+//4/y0gZHDAUHT+f/qcGw8//7/9/zwEYlN05H/S3C2PjvyHQ2yKdoGtC+2e/XzXfzDEpmg93OEB3ROfr/+/HovDDZajBIFv9+RbDBpEByb9wSgAAHeuVc8xgA8jAAAAAElFTkSuQmCC"/><element name="nextButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAeCAQAAABgMj2kAAAAlUlEQVR4AWOgAxgFnAyiDPwMzHA+D4MEEKMAuQeLS9IZ1OHKVP7vZ1BBVaL7cv+P/VfWwJUZPNrPYICqxODW/lv7H+//BlNmfwtTyfn9EHh7/+f9N1aml57HVHJkPwJuWZlUdgRTya79EDh7bWgGyKJdGEp01+9fv3/i2oAMmHPXYyiRm7zYNwPZ08vBniYcdDQHowAA/MZI93f1cSkAAAAASUVORK5CYII="/><element name="nextButtonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAeCAQAAABgMj2kAAAAlUlEQVR4AWOgAxgFPAwyDCIMLHC+AIMCEKMAjQc3S7oYTODKDP7/ZzBAVWLz8v+P/1eewZU5PPrP4ICqxOHW/1v/H///BlMWcgtTyfn/EHj7/+f/Nx6mzzmPqeTIfwTc8ihp7hFMJbv+Q+Ds56HdIIt2YSixWf9//f+JzwO6Yc5dj6FEY/It325kTy8He5pw0NEcjAIAWP9Vz4mR7dgAAAAASUVORK5CYII="/><element name="elapsedBackground" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAeCAYAAAAPSW++AAAAD0lEQVQoU2NgGAWjYKQAAALuAAGL6/H9AAAAAElFTkSuQmCC"/><element name="durationBackground" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAeCAYAAAAPSW++AAAAD0lEQVQoU2NgGAWjYKQAAALuAAGL6/H9AAAAAElFTkSuQmCC"/><element name="timeSliderCapLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAeCAYAAADpYKT6AAAAFElEQVR42mP4//8/AwwzjHIGhgMAcFgNAkNCQTAAAAAASUVORK5CYII="/><element name="timeSliderCapRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAeCAYAAADpYKT6AAAAFElEQVR42mP4//8/AwwzjHIGhgMAcFgNAkNCQTAAAAAASUVORK5CYII="/><element name="timeSliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAeCAYAAADtlXTHAAAALklEQVQI12NgIBmIior/ZxIVFWNgAgI4wcjAxMgI4zIyMkJYYMUM////5yXJCgBxnwX/1bpOMAAAAABJRU5ErkJggg=="/><element name="timeSliderRailCapLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAnUlEQVR42t3NSwrCMBSF4TsQBHHaaklJKRTalKZJ+lAXoTPBDTlyUYprKo6PN4F2D3rgm/yQG/rfRdHuwp5smsNdCImiKKFUAx/OaSpR1xpNYwKK4/2rLBXa1s1CnIxxsLZbhGhtD+eGBSWJePt7fX9YUFXVVylzdN2IYTgGBGCVZfmDQWuDcTyB/ACsOdz8Kf7jQ/P8C7ZhW/rlfQGDz0pa/ncctQAAAABJRU5ErkJggg=="/><element name="timeSliderRailCapRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAn0lEQVR42t3MTwqCQBTH8bcIgmirJYoiCOowzh8ds0PULjpRqw5VdCZr/WueMJfwC5/NezOP1lcUHWbv5V0o1LYSVVUjTXP4xYM4KTWYEB2ybFlcSSmLoK4F4vj4JmN6BFpbHs5krUNgzMDDLw3DCQHfTZL0Q85NYH0/Is9LNI240Tie0XUaRVGyJ4AN+Rs//qKUuQPYEgdg7+2WF2voDzqVSl5A2koAAAAAAElFTkSuQmCC"/><element name="timeSliderBuffer" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAeCAYAAADtlXTHAAAAKElEQVQI12NgIA/IyMj9Z2JhYWFgAgIGJkZGRhDBwMDEwMAI5TKQDwCHIAF/C8ws/gAAAABJRU5ErkJggg=="/><element name="timeSliderBufferCapLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAY0lEQVR42uXJyxGAIAxFUfrgI5CgzajdqlWxQffxaeiCzJyZ5MYMNtb6zTl/OhfuP2BZQ4h1mpLEmOWPCMd3pESSM2vE0YiKdBqJuDEXUT0yzydIp7GUZYMKAhr7Y4cLHjPGvMB5JcRMsOVwAAAAAElFTkSuQmCC"/><element name="timeSliderBufferCapRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAYElEQVQoz+WLyxGAIAwF6YM/CdqMlCtdcRHvMSIw9sCb2ctuIsQaU8pUpfQppT6mdC6QtZ6McYUPUpMhIHkP9EYOuUmASAOOV5OIkQYAWLvc6Mf3HuNOncKkIW8mT7HOHpUUJcPzmTX0AAAAAElFTkSuQmCC"/><element name="timeSliderProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAeCAQAAABHnLxMAAAAH0lEQVQI12NgIAT+/2e6x8D0k4HpOxj9AJM/CWpjAACWQgi68LWdTgAAAABJRU5ErkJggg=="/><element name="timeSliderProgressCapLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAQAAABOdxw2AAAARUlEQVQYV2NkgANG+jP/+zJkMtgCmf99vi38KPQTJPpq6xsvqIKznxh4ocwjCOaebQyeUOZmX4YFDEJQw9b4QQ2DAfoyAVkTEmC7RwxJAAAAAElFTkSuQmCC"/><element name="timeSliderProgressCapRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAQAAABOdxw2AAAASklEQVQYV8XLIRKAMAxE0R4QbhrXoQqJxWJxCGZqaKs/m1yi+80TSUqzRmNjCd48jMoqXnhvEU+iTzyImrgT+UFG1exv1q2YY95+oTIxx/xENX8AAAAASUVORK5CYII="/><element name="timeSliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAeCAQAAACP8FaaAAABMElEQVR4AeWSv0rzYBjFfy1NlU5RKC3dCjqZDwRXEapOuuik+BfbNLdUeg86pHSrm1Z3G3w7VAdbB+sNFFKIZ1FCjTjL95wQOOd3IC/vE/6vSZEmQ5Z5KUtGLhWjshYLbHCIKx2wLmcp/cJzOFTb/vtoGk7D8bDtc4GjNP2J/+ENzFv0FBnpORpHA4OnVBWwKFANTD96jKkfBYYqRVFyVC5bCr/pqsWmKDZHd8Okwv2IY1HyuL0wqRCE1EUp/lR4mFAT1XNym/iJ7pBTCpBnp5l4yGaLXVFsVqh1zCzuGGoiNuQoUcG7NjPYU1oSxVKrzDZuw+++BtPe5Oal4eOypdQWRVfNoswa+5xTl87YkysrjW3DpsQyDquSw5KcjXB83TlFeYoU9LbltO7ff5i/Mh+pOuncDFLYKwAAAABJRU5ErkJggg=="/><element name="timeSliderCue" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAeCAYAAAAl+Z4RAAAAcUlEQVQ4y2NgGAWjYBTgBaKi4llAfASKs0jWbGNj96S1tf03CIPYJBkCsrW6uu53bm7+fxAGsUFiJBmQlpbxOzMz5z8Ig9hAsaMkecHIyORJUlLq78TElN8gNlAsm9RwyAbZCsSHgDhzNFmNglGAHwAAo/gvURVBmFAAAAAASUVORK5CYII="/><element name="hdButtonOff" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAeCAYAAADQBxWhAAABf0lEQVR42u2VvUoDQRSFA0awMIVCsv+z/1oE8yOE9MYmtb2P4AspSOyECFZqtU9gbZvK6CNoNZ6zMMuSQpxdEAJbHC737pz59mbmblpSyn9XA22gDXRLod2uMYfWkKwh+uc60LVtO9J1RWXBn4N1oNL3QxkEEcwuzYybOWMh07QJ4xqK/ryuBQ3DWEZRoowdx3FfhAgkI3NVp7IsO5xMpnPDsFae59NHvzaURgWlWpblPEOSkbmqQzfQK2DT8fj0HB0rrz40jlOqgA4Go1m/f3LJWIYC8uQ4nkSX94vF3S5qX8qrDU2SlCqgOMMrAK4Zy1B27nlCIj4i34G+lbcC9ChXuSNeFEbmpZe5RZdv+BU4ZjM8V159aJoe5yp3JIS/eaZcv7dcPhzghc6Qr3DZlLc6FOelRoTn9OvI4DKxw2rQXs/84KzRyLPhTSSQGzIyV2OBdYzIYz4rgKxjn88/Q4fD0QUNNT6BBL5zH50Pfhvahzo1RH+7+WtroA10O6E/bVCWtAEB8p4AAAAASUVORK5CYII="/><element name="hdButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAeCAQAAAB6Dt0qAAABPUlEQVR4Ae2SsUrDUBiF/0EFfYK8Rl4g5BUUHGILRWghUHAQHJzaUcjSgB1EtCApliDoUApSKggZRFSUQsVAawspElz1OunxhwtZcm0Ht9LzQfLByVluLs145lkkjXQyyPwTg3uNv0tFKzuR+MAkIlF2eJyKPhBjRBMZYyBIp1SMEV6nMgIZlIoZQkJuIw7RiMll36XN5e31k0AkramYdiGhQjPsohlSgT13GTy8WXurR0mrmt5BQla+ZJ/mS2SxF8+GT7joLRRvvmWrnAaQULbi1R4rHmXZi/VhAO9laev6R7bKaQcSsv3+Lfw+2ey548B/t/Yz3pVs1dMWJORW4xaqfEzsfEwrO2te5ytpFVPjHJJntPnZ5jc708M9muwS1c/Ra8LHNGrKK6FlnENRxyQOPjcc0v5z/Wc68/wCXWlzVKUYIC4AAAAASUVORK5CYII="/><element name="ccButtonOff" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAeCAYAAADQBxWhAAABzUlEQVR42u1Uu0oDQRQVTCMopMjmtZvdJPswKCQbC6tYCEqMBDUGrf2NCDF+gmXEyiZWiTb+gMTGxtrGwmh8IOKjUoLjueNGfCBk10rYC4eZOey5Z+7M3O1zww033Og5BCGQA9oAcw6uz9kxbYfDIpMk2TGg58Z2TJmixFg0GueIRBQWDIZ5BX5/kIli5AcfCIS6PIH0nLdlGoupLB7XmCxHyegymTSXa7UdoVBYHBVFqQEDMjozzfRCvd7w5fNzKfD74ElHevumEHKEQiJD4nmYz4JvwWirWt30YiO36fTYNKotgj8Hv1GprPvAP1obtm+qqjqBhC/l8toAkh18uqs7rK8ZY/0Yj8AT90o80LG09k01TQe48Bnw4O6asqzw5DjGXVR2Qt9iPLb4Dh07NnGvqhq0jkwNQvehTCYSI0tIeIWqtq1jfAA/bhiJFcxvcPzVUmlVwPwJVZLWvqmuD3MgGYlbGHPN5qE3m52JYU0PifhTGEwRn8lMaFjvYVNdrXNT7BjGX1tGkvgL/dYyxMv0vTNTahH02ocY1cBEpTbgeL8z41eeNKSn6+jZNJUyiyT4y28Q+gvK07MpWsEDDAJDzsH1nj433HDjX8YbqHFYmhICTLsAAAAASUVORK5CYII="/><element name="ccButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAeCAQAAAB6Dt0qAAABWElEQVR4AWMY5mAUsDJIMBgy2DE44IR2QHkJoDoMINHQ/eTbl//44JNvDd1AzRjA8N63p/+f4IVP/9/7BrQZA9g9/H+fIHz4H+hsDOBw6z8EnvqZsJ6vznDCkke3/h/9Hr2ap9Z08oqnMFkGByxaL/+HwMiVafNufFl+hWvmiR+BC/IX3/yy4Bz/nJN/wbLYtZ75D4In/3GV7n56/v+1/zd/H/rGkHPgJYh94/fp/2B57FqP/AfBg/84SlY/O/L/8P+JLze/Z8je8PrI/0P/Jrza+Rcsj13r3v8guO9/+LKEhZu+9lzmn7zrl++c9BWbv7WfE5iy/S9YHrvWbf8hcP+P0FVsVSo9y57s+L/vm/9ytiqtvhVANlgWq1a79f8hcDPQR9eBAbIHyN7y/yyQfQnEhkCskWM4/9uq/4TgfKxJQiK6e/a3pf/xwZlfo4AJkZLkP6zBKAAAGMt/2TouFxQAAAAASUVORK5CYII="/><element name="muteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAeCAQAAACY0sZTAAABZ0lEQVR4AWMYjGAUMDEwMzCSpoUxju+kDQMXAW1AaRYGdiCGsFjchd/OWmELFMGrhd1a4UUTAy+QzXLSdKMhA1+Z/tuF0qIMTLjdz9tp+27ly/0M4kBbWGdqv1/gJcMgdLz6YAA2u9gYhBgkGGR2pH3ZfWf/1f0Mshdsk8UZBDYlXMthEJhqfbuVgQ9Tk9D//SD4dv/F/eeBkEHuaNjjegYBT/k78xiEOcWuLWIQxtQkcWI/MmSQYhC/shioUPjUAhB5cgFWTQf3I0MGaQ6JwyBNIofBmsAkpvN27UeGDPI349dXMghEKu2byyAsKLZ/IYMQzoBoTNm4e8v+LcCA2GBoKsQgcDFjcRqDwBr7dU0MfLiDnCfaavHKdaAgZ2ZgXWd4cZ6eJIPQ5YYZXgzseCNXQ35GPSRyt+lVaTLwTTA9NJdTmIGJ2GTEzMCSKPZifoklpj14jTDj6jJj4CI5nYOzxkCCUQAAMVp+znQAUSsAAAAASUVORK5CYII="/><element name="muteButtonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAeCAQAAACY0sZTAAABfUlEQVR4AWMYjGAUsDJwMLCQpoXRTnZZIoM0AzMBZQzcDCIMXEAWC5Dk0tZ6fK0uFyiCBzAziCh5Xd7PoAJkc64I7QxhUPWLf/yQ3xjoTByAjUExrvzB+5f/GewYOBn4cgOf3ddxYNDftH1OCza7BBgMGBwYfCas/fjnzv+r/xn8NiXYGTJoTZ25ZymDTn7W8UMMapiaDP6Dwdv/F/+fB0KGgJXtF3YyaGp7XLrLYMhqce4hgyGmJocT/5EhgxuD7ZknDEYMJgcfMBgzGB8AkZiaDv5HhgzuLPa7nwBNN90N1gQmMZ236z8yZAjcN3H+JgZNM+8tQOdxWm17yGCAMyBSV6//s+X/lv8Mvv2BChoM2hsXd89n0GnKn7+PQRV3kCvYlsx6v+4/gy0DOwNvU8SJO1LWDAb791bUMgjji1xhMc/u3QzKoMid6hPtxaCakrbzDqsBAytxyYgZmFQ5bfXu3Q1Lx7QHrxHykgWRDFJAA0gCLAzsQC0DCUYBAC3AlmbNhvr6AAAAAElFTkSuQmCC"/><element name="unmuteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAeCAQAAACY0sZTAAAAiklEQVR4AWMYWWAUMDKwMLADMUla2K0VnjUx8BKvhYmBt83m3cp3+xnEiFHOxiDEIMEgsz3l6+5H++/sB7KJAEL/94Pgu/1X918GQuI0SZzcjwSJ1XRgPxIk1nnb9iNBoCYSAqI6ZdXOtfvXAjWREuQ84VZzVi4DBjmJkassN7GegZe8ZDQSwSgAAJ/LQok1XVtuAAAAAElFTkSuQmCC"/><element name="unmuteButtonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAeCAQAAACY0sZTAAAAjUlEQVR4AWMYWWAUMDJwM4gwcJGihZlBRMnr0l4GZeK1sDEoxpQ+eP/uP4MVMcoFGAwYHBh8+ld/+vPo/53/QDYRwOA/GLz7f/X/ZSAkTpPDyf9IkFhNB/4jQWKdt+0/EgRqIiEgElct/7P2/1qgJlKCXMG6eNL7Zf8ZLEmLXGFhj5bdDMrkJaORCEYBAOZEUGMjl+JZAAAAAElFTkSuQmCC"/><element name="castButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAQCAYAAAAWGF8bAAABuUlEQVR42mNggAA2IBYCYgkKsBDUHDAQevr06X5KMdRQMJDYvXs3SECLTNdpQfVLwA3cuXMnigCJAEO/xPbt2ykyEF2/8NatW0ECwuQaCNUPNpAZiAVqamqsgTQXuQZu2rQJYqCXl5cQ0LkpjY2Nbuzs7BJQQ5lINXD9+vUQA8PDwyWPHz++4/Lly/uvXr26btmyZUkCAgKiQElWIGYk1sC1a9fCvczNwcEhHxER4T59+vTuEydO7APiqS4uLkpQQ4kycNWqVRADQ0JCxIAu7JgwYUI0CwuLWlpaWtDmzZu3AsVmqaurSwIVsRBj4IoVKyAGurm5iQKdO/fUqVP7Tp48Odfe3t4wNjbWG2jo3o0bN5YAFfES4XUJYFDBvQyKBBmgIX5r1qzZBHTZAh4eHrWOjo6GPXv27ARaqApVI4wvpyxZsgRiIDDsZM6cOTPT19fXLDIy0hvo2n3z5s1L8fT0tF66dOm+uXPnxldXV+vdunVrPz68aNEiSF4OCgqSBUU50GXTgQLSU6dOnbFt27YpIFfPnj17JdCCalA6JeBClNKGHYgFgZgfiDmhYcYL9SaI5iEyYsAAACZV+irLroZ6AAAAAElFTkSuQmCC"/><element name="castButtonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAQCAYAAAAWGF8bAAABuUlEQVR42mNggAAOIJYAYgUKsATUHDCQePr06X9KMdRQMFDYvXs3SMCCTNdZQPUrwA3cuXMnigCJAEO/wvbt2ykyEF2/1NatW0ECUuQaCNUPNpAFiEVramr8gTQfuQZu2rQJYqCXl5cE0LltjY2Ncezs7CAbeIGYmVQD169fDzEwPDxc8fjx498uX778/+rVqy+WLVvWLCAgIAOUZAdiRmINXLt2LdzL/BwcHFoRERHx06dP33nixIl/QHzcxcVFF2ooUQauWrUKYmBISIgs0IXbJkyYUMnCwmKclpaWt3nz5k9AsXPq6upKQEWsxBi4YsUKiIFubm4yQOdeOnXq1L+TJ09etLe3d4yNjU0BGvpn48aNs4GKBInwugIwqOBeBsWsGtCQjDVr1rwFuuwqDw+PcUdHx+o9e/Z8B1poBFUjiS+nLFmyBGIgMOxUzwCBr6+vR2RkZArQtf/mzZvX6unp6b906dJ/c+fOra+urra7devWf3x40aJFkLwcFBSkDopyoMtOAQVUpk6denrbtm3HQK6ePXv2I6AFS4BsMQIuRCltOIFYHIhFgJgHiIWgmBdKCxAZMWAAABFDD0iNkbKIAAAAAElFTkSuQmCC"/><element name="castingButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAQCAYAAAAWGF8bAAAB60lEQVR42mNggAAOIJYAYgUKsATUHDCQ+E8FADUUDBRevXoFEnAAYgsoTSwGq4fqV4Ab+OLFC5CABZkus4DqRxj49OlTsAtBNKkYpg/ZQKmHDx+CBCxBNKkYZCCUBhvIDMQis2fP9gfSKjdv3vx07969/6RgkIFQGmwg35kzZ+omTpwYxcPDo6mmpmaybNmy6devX/9569at/8RgkIFQGmyg8Nu3b39++/bt/9evX1/u3r27lYuLSy87Ozvy1KlTz65du/afEAYZCKXBBvKKiIhol5WVpe3cuXMX0PB/z58/P+3u7m4dFxfnD3T9x0uXLv3Hh0EGQmmwgYJPnjzZvGTJkkpOTk6TysrKbKB3P718+fKKvLy8QUNDQ965c+f+48MgA6E02EChy5cv33z37t3/N2/eXA4ODnYrKipKuXr16s8LFy4sAsprAl1+6vTp0/9xYVA6hNIQLwOxWnFxcd7Zs2ffvn79+q6cnJz5ggULFj148OBXUFCQNVBeCYjN8eWU48ePww0Uef/+/en09HRfYESkAJ3+Z//+/f1OTk7uR44cAbG7qqurCeYgoFp4XhYDBSgwL14FpcNNmzYdunHjxkWQq4FevXb+/PmNQLY4EEsSW9pwQDWIAjEPKJJA4QoNCiEon5WBSAAAryiVoYy0dtoAAAAASUVORK5CYII="/><element name="castingButtonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAQCAYAAAAWGF8bAAAB60lEQVR42mNggAAOIJYAYgUKsATUHDCQ+E8FADUUDBRevXoFEnAAYgsoTSwGq4fqV4Ab+OLFC5CABZkus4DqRxj49OlTsAtBNKkYpg/ZQKmHDx+CBCxBNKkYZCCUBhvIDMQis2fP9gfSKjdv3vx07969/6RgkIFQGmwg35kzZ+omTpwYxcPDo6mmpmaybNmy6devX/9569at/8RgkIFQGmyg8Nu3b39++/bt/9evX1/u3r27lYuLSy87Ozvy1KlTz65du/afEAYZCKXBBvKKiIhol5WVpe3cuXMX0PB/z58/P+3u7m4dFxfnD3T9x0uXLv3Hh0EGQmmwgYJPnjzZvGTJkkpOTk6TysrKbKB3P718+fKKvLy8QUNDQ965c+f+48MgA6E02EChy5cv33z37t3/N2/eXA4ODnYrKipKuXr16s8LFy4sAsprAl1+6vTp0/9xYVA6hNIQLwOxWnFxcd7Zs2ffvn79+q6cnJz5ggULFj148OBXUFCQNVBeCYjN8eWU48ePww0Uef/+/en09HRfYESkAJ3+Z//+/f1OTk7uR44cAbG7qqurCeYgoFp4XhYDBSgwL14FpcNNmzYdunHjxkWQq4FevXb+/PmNQLY4EEsSW9pwQDWIAjEPKJJA4QoNCiEon5WBSAAAryiVoYy0dtoAAAAASUVORK5CYII="/><element name="trackButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAeCAYAAAA/xX6fAAAB3ElEQVR42u2VP0sCYRzHLwiFUm4oIcUGz4ZMsRqkhhan2hzyBWSvwMXhAsGlFxA46y2JeJpDIeEfDnV1UhdX/+Du5mS/LzyC2F09KDjdAx94nuf3fZ6PPj53CovFQtglgik0habwX+FasxDHhJfwM7xsDjUbcUZc6YB5G69wj7C7XK5AqVSSR6NRfj6f1wD6xWLxBTXKXNMazQhIeYX2SCQSnk6naqfTySYSiZgkSXcAfZpTUAuFQrHxeKwZwSu04NNPJhM1k8m80thHiMQ+A30fasPh8EMUxQiNw0SUeFrhgTjhER6pqio3Gg2FySzC74Y5H2WyyFL/Zpsj9Xa73Xw8Hn9m38aoiZSJIUv9+16vp63DKwz0+/2G2+1+pL6HONCRYc6DDLLUv2U3M7rJkQaazWY9l8u9z2azCo0lHaGEGjKtVquONezbbHSkF7TR52Aw0NrtNhYFdYRB1JCh7BfWYHP6TbVVeIX+arVaq1QqGmBHtd6ulnVk2Qth/SXA/eCf04NdK5fLGjASLuvIYo3RzeIROlOpVLpQKGiAxpc6+1wu68lk8g2XYxuh1eFwBGRZTiuK8m10aVBDhrI4Tus2QoFt4CROiUOdfQ5ZzfmXjEto/gGbQlO4c+EPA9e3TyseGL0AAAAASUVORK5CYII="/><element name="trackButtonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAeCAYAAAA/xX6fAAAB3ElEQVR42u2VvUsCYRzHj4awhq5AF3Mol5bSFjMSstYabGusuaVbHBwEsf9DpMDBF4QGB8FBhSYnvQahIfTEtsIg6AWevt94hLCzDoWm+8EHfi/fe74+j/eiCCGU/0SxDW1D2/BPw5FwgGXgBzsSv+xxtgg2wZ4J7C9aNZwBS263O1QoFC673e79qwzm+Xz+ijNo9sUvQVOrhkuRSOS43+8bjUZDj0ajSa/Xe0SYo3fLWSAQSBqGIcZh1dDBX9/r9YxUKnWNOgicYFbCPMhZp9N5UFX1DPUx0EDiG6dgxYqhO5fLXVYqlVtp5lB+BntBaHRqkR9Mc6T+ZrN5r2nahdzNuHBCk6QW+Umr1RKjWDUM6br+4fF4zpGvgwUTM/bWqaEW+aG8M7VJjjRUrVbfM5nM3WAweEa9YWK4wRk1tVrtndfI3Ux0pNtY6LHdbot6vc7GronhLmfUQPvEa7g4/lPxHauGO+Vy+a1UKgkij2o09oZzauULYfQlYPnB38KD/VosFgUZZzicU4s6MO7OsmK4mkgkbrLZrCCowybrhIfzeDxe5c0xjeG8y+UKxWKxm3Q6/YLaZ7KOjzNqoOVxzk1j+GXKnYI1oJqso8rZqtQqExvaH2Db0Db8d8NP8a/SZovcDd8AAAAASUVORK5CYII="/><element name="fullscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAeCAQAAACC7ibdAAAA5ElEQVR4Ae3KsUrzYBhH8RPIFAJ5O3/ig5COgVyHW7N09x7aXSrESafuHeLi0A6iGEX+Y3edLMqnpe7egfbFMZCMXfo762GH9gIijIx8W0rcMQ9tU/3oL9KOGXdYLOuNfOS0CrGLyVr/fZ1zMht9a6VXqV6JjFa9efmiZ43PDoqnCqMh8BGS4IjpT8vTMYY7NiIaooHhsNnovqRPTA9HSOCjwT6ro+Jy8qV3PZT0aJUt9VavdadbnY9IaJUv9KiF5jqZYIQd87V80/rfAEdAq/RKvht9VEPrmmNS8m0ZRkTAzuz9AlNJVl+tEWchAAAAAElFTkSuQmCC"/><element name="fullscreenButtonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAeCAQAAACC7ibdAAAA5klEQVR4Ae3MIUzDUACE4b8VlU1FaQWEBPlQna+oxqHm0dTicShQcyWZwSBWEgohEIKcB8UKAZbhcZXHmsw1eZUz+357OdZow8HHkJItSwiwcodmUWuFpO852s2nzUJtZFh5mPNyrq+23nE4Lv4007templIsYon1ZtedXKzkz/XGDocXBw8QiICBqPq9JJ9ogODT4d/aIgw4+KhYkBAzBbe6qLD/NR7+UX5q089VsRYpVN9NHPd605nBSFWWaknlZroqMTg9Yyv1TZqto+JcLBKrtR2q+96aHCxCkjIlqUYfBzWZuMfAHJlDLF+xFEAAAAASUVORK5CYII="/><element name="normalscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAeCAQAAACC7ibdAAAA50lEQVR4Ae3KsU6DUBhA4QMNAtsNFcJLyKBx8mXYmNxkculDuJG4OOOmcbr/QNS1xKaJqxJjTJpUk84KuHW4d+nY76yHvV1zxlx8AiZYeJeHBKgmX14wte1qXZ1l98VG/8iyJMQo+ZJVvdGddPohx8co7eRThvWmQOFa5ncZWtSnRwQ4GEVvMvQh62oW2+YDItK+BIW3PTt4KJJxiPrVyJnF39Wv/EdkmQlOsqd6IUOkGLmou+JVv0ifdfabfKVbaXVTt0KCUfhczmWur4rj7LFCYTRhelte5yiC8xgPbHuIj4sztrdbfxJjV3K8mZ7yAAAAAElFTkSuQmCC"/><element name="normalscreenButtonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAeCAQAAACC7ibdAAAA7ElEQVR4Ae3Sr07DUBzF8e+daKaaiaYNAoH8uc43pK+AmsHimETxDAQBQZVkCQhAUFMBewkUCG4W/ib4haTykCYzmFszuc+xX3lYtw3HAEdEQsqQHvGekWKz6qFh3Jfbl9+Znta/WmrekBFU/GjRLvWuN11UJASVXh/yetVxjRH1xM/qNm+3D0lxBOVP6vaiTz8xBgSNyCkpKTBiHP84YoyiC8gZETSY2LfXCjlBjnRretk26kZJUISd1I+679YbJ7NqoTvd6Ly9FQVB2ay51pX262x65jGChoyPmoMKI901YujLMxKi1TnXa+MPEjlkhvYbWGMAAAAASUVORK5CYII="/><element name="volumeCapLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAeCAYAAADpYKT6AAAAFElEQVR42mP4//8/AwwzjHIGhgMAcFgNAkNCQTAAAAAASUVORK5CYII="/><element name="volumeCapRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAeCAYAAADpYKT6AAAAFElEQVR42mP4//8/AwwzjHIGhgMAcFgNAkNCQTAAAAAASUVORK5CYII="/><element name="volumeRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAeCAYAAABaKIzgAAAASElEQVRYCe3BsQ3AMAwDQRIW4Cqlkf031AZKVkg6An8nAQCAH3zOPQpQe28lqJcS1FpLCcpWhJKsBGVbCaq7lcAzcwkAAHz0AE0SB2llBfTtAAAAAElFTkSuQmCC"/><element name="volumeRailCapLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAeCAYAAAALvL+DAAAAeElEQVR42tWKQQqDMBBFB3cFt9oQQ0wniW51b5f2ti30ZLX1AN+ZQA/hhwfz/zw6eZrmmoWn8NUyCh9jLJzzoLY1L2sd+v6GEBikmh7MCTHmYvyYI1LKBeo69/Y+SBkKtCz3SaztPxKAal0fs5ry2Emjo3ARajpNDtqHL/b2HUUVAAAAAElFTkSuQmCC"/><element name="volumeRailCapRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAeCAYAAAALvL+DAAAAeUlEQVQYV9WKOw7CMBBEV3RItAmWYzlmbUMLfSjDbUHiZASFfpj1LTLSW+18RLarrjt+yZPUFoQQ4ZwHgw+5SEqKcTzB+4C+dy/JuUK1wAouVimlwlDNtvgxOMOIMWEYwrsFZtgu03S/Cp/Vmnl+3ADshOdA9s1sSn8goC/6ib5oHgAAAABJRU5ErkJggg=="/><element name="volumeProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAeCAQAAADwIURrAAAALElEQVRIx2NgGAWjYBSMRMD4/z/1DWW5TQOXsnwdMoZ+GyouHQWjYBSMTAAAnO8GxIQ7mhMAAAAASUVORK5CYII="/><element name="volumeProgressCapLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAeCAQAAAChtXcIAAAANUlEQVQY02NkgAJGOjH+9zEkAxm/JrzJ/wYSufTxLx9Y6shHBghj10SGPKji9RMYkhjp6EIAcaIN1SJ2FnYAAAAASUVORK5CYII="/><element name="volumeProgressCapRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAeCAQAAAChtXcIAAAANklEQVQYV2NgoCP4//F/H5hx5/+z/78mABnn/5//f+kzkHHkPxCCGLv+A+FEIGP9p/UgFXQFAHkZGwN2fDIsAAAAAElFTkSuQmCC"/></elements></component><component name="display"><settings><setting name="bufferrotation" value="90"/><setting name="bufferinterval" value="125"/><setting name="fontcase" value="normal"/><setting name="fontcolor" value="0xffffff"/><setting name="fontsize" value="11"/><setting name="fontweight" value="normal"/></settings><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAA0CAYAAACQGfi1AAAAYklEQVR4Ae2VwQ2AMAwD/cgKVRbJuAyH+mOBfMMQyBKCuwWsxoaLtfKQkaiqtAZ0t5yEzMSMOUCa15+IAGZqgO+AFTFTSmZFnyyZv+kfjEYH+ABlIhz7Cx4n4GROtPd5ycgNe0AqrojABCoAAAAASUVORK5CYII="/><element name="backgroundOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAA0CAYAAACQGfi1AAAAY0lEQVR4Ae2VsQ2AQAwDXWSFF91Pkf1rxkAZIm0YAllCcF7Aiu3/i7WOU0ZFZm6rQXfLaiCzYkbuC+b1EWHATM3iHbAiZkrJrIiSP/ObQjQ6gAcg8w/AsV/w2AEmE1HVVTLqBmJaKtrlUvCnAAAAAElFTkSuQmCC"/><element name="capLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAA0CAYAAACHO2h8AAAA4UlEQVR4Ae2XwUoDMRRFT17GTscIMoWOqwF1WUSFIv6Autf/X5TuxG6FBkOeHfAHpk+GLnI+4HBzLzyI44/l8uoBeAVugJqRuIMA4L1t24+u685DCGci4hhJBdwPkr7vL3POLsaIqnKM6G2xaJuUksPAILquqtlMFayiuYhzYDMJIygi+2qonloi0CkTldXK/NOXXVYrZRs6UgyUjsrxL6d28sP2b4n0xJ62z1nVHbCutolx/4MRH8LFt6o+Nc28tqTyq9Xd5273RUrpVsSL915gvNCt188MbLebR+Dl2K/oL+WmRveI4jXNAAAAAElFTkSuQmCC"/><element name="capLeftOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAA0CAYAAACHO2h8AAAA5ElEQVR4Ae2XMU7DQBBF346sIDAUDoqprNBCm4Im3IPcAE7EEbgId6BF6akQjheZGTYSF7DXQi7mSdM+zf4vjbSBP1arqy2wA26BUwZSJAHAY1VVT3VdX5RluZDEYBGwPUqaprlUVYkxYmaMEe2Wy+q873shgwK4KYrFiRnkis5EgkCeScjHRQNaw2xuG4HNYiNvzeufPmxvzcPOz8jIwDPy4++n9t8P22Qb2cye1qqahhAkt7W3GLvvKep/+Uyo/igYY0fW6+vXtv16/kgcDl2nagkYOmGzuePIfv9+DzyM/Yr+AujSfWZZzzLnAAAAAElFTkSuQmCC"/><element name="capRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAA0CAYAAACHO2h8AAAA20lEQVR4Ae2XQUrEQBBFX4e29QJDVgFv4Cb7wSt4Ps8wLtw5B3A97mfmAFlkkbaZMpAynkBiBRGpd4Ci6j/4UGGzqR9ZjgBn4AV4A4ht29YsZJomzTnXXdfd9X2/A55iKYWlhJmU0nXTNAl4mIedwnZ7/4wBkcvH8Xh6jaqYiDFdAbcRFAtVFQJwU7ESPuh7zPrX3wj0T2zk1lz/+mG7NQ/bnpFixDPy8veq/dViW20j/W+drTOAmK2JXEbgbDrt628bhqEA+x+dpjMiMuY8lFLed8DB+orugQPAJ8i7bEsKl1PuAAAAAElFTkSuQmCC"/><element name="capRightOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAA0CAYAAACHO2h8AAAA2UlEQVR4Ae3XwUkEMRTG8X8eIaLgwYXF0xRgKYsVWIIVrR1sI3uwANkSvMxhDhOzRoZ5pgOZSZiDvF8Bjy/vgwdx+/3jO8tdgQtwAs4A7nB4/mShuYgx5r7v4zAMR+DNp5RYyjknIYTbrutugNcy7ENYQVUpoZimSXa7h3vgxatSxfsQgCcPdZNEnAB3QiM26G/V9bdPBLp9ImvN6t9y2daaLbtiR0ol25Edfzu1mx62Zon0v91sVZ2Bq1Ap5+8f4FL1tLkYC+C06mla5CLGcUzp6wicm31FfwHzmG90m7lXIAAAAABJRU5ErkJggg=="/><element name="bufferIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAABGElEQVR4Ae3Rr0pEQRSA8Zl1b1uDQTAt4j8QES1qURZvEf8lfYJVsfoAisYFq9mgyfUFVptgMtk3CAaD6DN8HoYbFhk9w9x0Yc6XDsv8LrNj0vgnTZo05LzzyR7m/wxafQC+sDHQENkv6DsG2uFV2i62nDc+2C82SybVwqAX+tIzxlOdzBUEPTnosTy0wgM9lryQpS7pVwutetAiN3RZU481mJYaf0PX9KR7rALNMCtNaVC3PLTALXesYpSGlatFVDFonnNOmfQeGKHFOqNhUIcr6cwLtdiVNkIgy6WDLrxQ7qBNrApJy0J1mCu2CY6k4qKMCbJFM/TPHvzeASfS8cBvtbhXazvosPzzN2lL4/GQXoISlKAqQz+eXnU2Tp6C2QAAAABJRU5ErkJggg=="/><element name="bufferIconOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAABGElEQVR4Ae3Rr0pEQRSA8Zl1b1uDQTAt4j8QES1qURZvEf8lfYJVsfoAisYFq9mgyfUFVptgMtk3CAaD6DN8HoYbFhk9w9x0Yc6XDsv8LrNj0vgnTZo05LzzyR7m/wxafQC+sDHQENkv6DsG2uFV2i62nDc+2C82SybVwqAX+tIzxlOdzBUEPTnosTy0wgM9lryQpS7pVwutetAiN3RZU481mJYaf0PX9KR7rALNMCtNaVC3PLTALXesYpSGlatFVDFonnNOmfQeGKHFOqNhUIcr6cwLtdiVNkIgy6WDLrxQ7qBNrApJy0J1mCu2CY6k4qKMCbJFM/TPHvzeASfS8cBvtbhXazvosPzzN2lL4/GQXoISlKAqQz+eXnU2Tp6C2QAAAABJRU5ErkJggg=="/><element name="errorIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAAB3ElEQVR42u2Tv0sCYRzGv5WFJIVgkEVLSy1ObWGDUE0OgdRYtBZC/QENFv0DDTW0FEYJGkgEBUZCEFxYlJpnEMSpUxpBNAkiT++rlb+uvNOpuOcz3Pt+j3vgeN8PkRYtWv5Z2qmb0d58kXl7ZXuFzM3W6E3jybfUW+8E6ZupaaXB3ZNnPGPnlAbZruF02ebTuRRSSOds89TVaE0bWYJiEhIjiaBIFjZpKKaF1TSePknDuUamRmo6dKPRzCNKRDO6UepQW9NCAxseCXHGlHvKzZ8SNjw0wN6oSqfFIWXvwSE72YsrKWtxkEHdsQ/5hRjuCpCNbMVVDEdXNKzmGhhnlqT8DYrwoq+1lJ9ZIqNyu0aERAhXn/Cir3UIQoJGlJpndm2KuPyGF5V2IlxbyszTmybi7xcowYvK9/H3/sn65hXsEnBeBi8q3wuKzGN2PeQCKIcff+Xkoa55zK4zMYCTCubcs+7KSQBn3DzdL3Ytrt3iuIpXRvXsFs516vnFruuMH8oI/Whewa4gDmsY8435aqfBH81jdoWzXtTi8Dm8cvOwrHkFu/zwyJDBi+yc/aCMecyuUH4f6rjOTy9Xm9cXiRxgTyX7iESor7LIQENk5XdYFVb2lYG0aNHyF/MB+x5LQiE6gt8AAAAASUVORK5CYII="/><element name="errorIconOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAAB3ElEQVR42u2Tv0sCYRzGv5WFJIVgkEVLSy1ObWGDUE0OgdRYtBZC/QENFv0DDTW0FEYJGkgEBUZCEFxYlJpnEMSpUxpBNAkiT++rlb+uvNOpuOcz3Pt+j3vgeN8PkRYtWv5Z2qmb0d58kXl7ZXuFzM3W6E3jybfUW+8E6ZupaaXB3ZNnPGPnlAbZruF02ebTuRRSSOds89TVaE0bWYJiEhIjiaBIFjZpKKaF1TSePknDuUamRmo6dKPRzCNKRDO6UepQW9NCAxseCXHGlHvKzZ8SNjw0wN6oSqfFIWXvwSE72YsrKWtxkEHdsQ/5hRjuCpCNbMVVDEdXNKzmGhhnlqT8DYrwoq+1lJ9ZIqNyu0aERAhXn/Cir3UIQoJGlJpndm2KuPyGF5V2IlxbyszTmybi7xcowYvK9/H3/sn65hXsEnBeBi8q3wuKzGN2PeQCKIcff+Xkoa55zK4zMYCTCubcs+7KSQBn3DzdL3Ytrt3iuIpXRvXsFs516vnFruuMH8oI/Whewa4gDmsY8435aqfBH81jdoWzXtTi8Dm8cvOwrHkFu/zwyJDBi+yc/aCMecyuUH4f6rjOTy9Xm9cXiRxgTyX7iESor7LIQENk5XdYFVb2lYG0aNHyF/MB+x5LQiE6gt8AAAAASUVORK5CYII="/><element name="playIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAABHUlEQVR4Ae2Vu0oDQRRAB2xSWVmmtQncLzFREUUsnW/wJ0SCWgQV8TUQBBEsjlgIFoJFCsFCCT5QgwZFtPGtncUWIcTZnd2pAnNOf2Bn5t5VgUCge8mpPtWrevxD+cbi1KTq948VXvjlbMM/Jk2aPPPjHZM7Ip88Y3JLy0e+M8fkmnYfMsbkkk7v+Uodkzr/2+AzVUxOsXvDh3NMToj3inenmByT7AVviTGp4WadV85XK0WVs4SOcHd3rVyyhg5xc91M6NhPOyDZFTOuEw97n3iXzZh2uv497C6YUe38ILFQMSM61Yjs0Om8Gdaph3abdmfNkM60RrZoWTaDOvNi2yRyxpQsETcKVapMm6JHJCI/tzTgEfH4QXYxgUDgD+1pwmmFlV3oAAAAAElFTkSuQmCC"/><element name="playIconOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAABHklEQVR4Ae2VvUpDQRBGt7BMaekD5AEsU0zvL6KI76CdL6FDUItgIYJNEERIoVgIFoKFhWChBBNRYwwZRBv/tfostgghuXf37lSBPac/cHd35ppIJDK45MyIGTZDRk2+UVteNaP6WOEVf7hu62PUQgsv+FXHqAnrszJGD+go+AmO0R26bQfGqI5en/CdOUZV9LeBr0wxukKy9/j0jtEl0r3Fh1eMLuC2hndnjM7hZxVvuHksLZpcQugM/h42i0uJoVP4uSMLnPppJ3C7LfPsPOxjpLslc+x1/UdIdlNm2ftBHqC/JZnhTCNSQa8bMs2Zh3Yf3a7JFAetkT10LMokBy+2XVhZJgIjlkIZZazIuCJiya/Xx9QR/Q8yEokMFv9/Ax7UXjl24wAAAABJRU5ErkJggg=="/><element name="replayIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAADOElEQVR4Ae2VUWhbVRjH/0nqdk0m0eTGITVZNsmiZCLTlooNPoWlbk27lzmGSIeyh7YgFSYaGO2yDZk4GMi65kG9d6kkbfCuyf1bqZmmlsYxCK51KwxkrpM4qBRla18cIngvw0qgN7ea1/z+L4fDn4/vO+c730G9NGjQQIALj8CKumn+afjIQWyDHRbUxTO/8w/Ojux9Bc0Q6gn27B3eoRZM5Zm2l7EVm/5bMAsEiPAjiFiFun7hXa5MjJ7Y1gI3mjYaxA5vZzSdmJeWlfvqz/xHFd7jr5+fP+rYgU0wpQlibE8peV+9yyVWeJuLVapwleU4tsCEh9B8sn8lt8SbBprJvHUEXrOMmuCVj61o9h81fXEhEY/GHAf09QOVlaF3N4fgNDsjCzxnBn7jDU3T2TfexE64IeC5G9Q1lz/7/vY2iBs5aHtndCm/wAXmUtvb8ShsD/pogdf46bm2CJ7Qr16THY87t0Iwzsf77ch1/sBCdmcYjrVuaZ4813UAPjwMC3SXsztS+ujqWTxp1E9CV8ct9Sq/56EeOGGpemtb1t6a9bXdq7nbvKV2dRjlJKaOl1lm+gICsME47x1jsu5LHYeIdfEXpCu8wsE43KiFezCu+woS/FiX4KxSYon7YhBQC2FfTPfNKghiXUIldYYzdLfChlpYxRbd952KkEGgr9Uii3z6JbNAnhbd941hoOBF5RIv8WC3SWmbuzt130XD0vyfSFOc4gfvwIVauD48qvs+Njxs8URikpOckmtevw2Br2Tdd9Lw+oVIR15VeZl91Q1Z3UXOvp7LVJlXI4YNaYHvdHKCE7ye3fXvE6l2OHaFr43rntNJ+IxHrj0czeQVFjifCrbDCRuqi3IG2+dTBSrM5MNR2GuOkcMD48xymotZrcAAXBBghQ0C3Aj09Sxmp5nlOA8PwAOLyWDrPZbhGL/kMufkkff2xx5rferFQ/vPx+fkZW13jBn2D8KrOc1H7av9ci7NNIu8yVX+xT95T1sVqe/J+dffhldzYUPD/4U9Q8lR9TNWa5RDyeej8BhkY/Qd7Y72Jk5Jw4qkSuqwckrqTbTuhc/44zb/IEOagtpK/N8fdoMGDf4G6kd7103/csoAAAAASUVORK5CYII="/><element name="replayIconOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAADTElEQVR4Ae2VX2xTZRjGH1iBzDMrU6lxLdOFhLJ/CepwTWCJiUSTDTdilikxJmAo2GlJ9I7EsCgkw6jRG5ALtZNJy7QDiwxK0dZllSypssqatCHIMKdzM4uEnUUrtj2P57uAULNzOtltf8/Nl3OevHnf73u/70WJxVKiRAWqcD/KsGjsvyScb6EBZizFoth4nX9zJNn6KtZCwhLcNU9NcpJasPw3o80vogbl/y/YUkiwoRHNcMsUSvMGlX/6zz3SCiuWLzSIGXVbnN5gXJ7566b6K29J5ix///PwMWk9ylGUZVj93M5o6qZ6g9OUeY0TBZI5x9ggKlGEFbDvP6Jkp3lFR8PX93yEOpQXy6a2L6Bo9suaTv/2tv/ZPdLey7ylWKZnYEULLFhWbG+q3/f8waSmiPLKB3gSVkh4OkmhsdyHkZoO2Bay0eYtzulcggl+PVXTiYdggmBjgpf42XjzDqwRRy+OAo/eVwNJP5+675Pj/JkhZW0XVt7uFvvQePte1ONezSFclo4d0fjFH7FOr9Ol9l1X1Yv8idt6Ybmj6SRUofL2XSt76Zm57DVeVdt36eVkO3o2xhi9k9gAE/TzXn88LXxHz8KGeWkMyaMc5T4/rDDCus8vfCEZjZgXx0gmyijb3JBghNTmFr6RDByYl5ZofpjDfKANJhhR9mCr8P2QR4tOoG/zYYa57vligVa1Ct93uoEcJzLneZ4vvIEKGHFPx+vCd0K3tMZP5SCDfNeLKhjx8HvHhO8T3c22vRMc4hCDaTQZFGdC07m08O3XPX5p8+6AeooX2F3QkAUsgaW79wJPMaBu3g1Jr9XqD6ZO8iTHlYY7rkhBmJUNXZdmhedgCvX6w8C8yenLDTLE+JS9ExaY/lOUxd4ZnwpxkL7cJifMhs/Ids8Av2SEE4pWYBOqIKEMJlTAiqbu3gklov0d4HYPqo2H03LUugI+HucZznAs/fFXW92VbWu2bnvzsH8sPcMz2h8fXzuNWs1Z/KntOtKX9dLLMK9wjnlmOautwhTf+nIvf446zYUFPf5P7OxJ9atfsFD97Ek97kS1TjZ64+gxpyt4QD6U8age9VDmgOwKbnChXn9wFxuQDrRocmir1ai4y+lfokSJfwEhAcqxd5L4JgAAAABJRU5ErkJggg=="/></elements></component><component name="dock"><settings><setting name="iconalpha" value="1"/><setting name="iconalphaactive" value="1"/><setting name="iconalphaover" value="1"/></settings><elements><element name="button" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAgCAYAAABpRpp6AAAAxklEQVR4Ae2YsQ3CMBBF7+yIximQSERSMgYNI1AxJgswAaMkLREpEnQ2Z6Chooqwpf+k65+evhtzXW8LIjrp7fUcpcmod9U7v2Sbpjm2bVtaa5kSRERC13V13/ePIpatqk05zzOHEChFWImOKnyIwk7EMyXMJyTrOUOZAeGlKd4byUtYCZjEN9gwCuPRYRKYBCbx18JLJ0bh3IQJk/gFHh0Ko3BWwqOID8YYpoTx3ofoap0r18y0WymspCo7DLf7NE2X7L5bnyz7UgI6sO7WAAAAAElFTkSuQmCC"/><element name="buttonOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAgCAYAAABpRpp6AAAAzklEQVR4Ae2YMU7FMBAFx04osQvyRQIX4nfcgRZOAxW3oMqRkhKbBkWyjVfiCiD7a0dKPxq9dZHxdLq9Al6AB8DRJl/ACryOwPM8z0/LsvhhGCwNklLK27bd7fv+LcLnabrxx3HYUgotYoyx4liFH0XYpZQtDfMb0orrSGeo8L8Il9Jd4dL5JFRYN6xHp5PQSegkLuwd/uPEWrg3YXQSenRaWAtfVOGYUs62QsPkiriK8Brj571z3ot0q7IxhgB8iPBbCMHU7wxcN/679f0HQzRYj4Eg/3AAAAAASUVORK5CYII="/><element name="buttonActive" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAgCAYAAABpRpp6AAAAwUlEQVR4Ae2YsQ3CMBBFD8e0CVESUcFMpGMKapgAKvagymKWiF3RxMe/IUDn6J70I5dPX98u4odhvyWiG3JCdqSTiEzI3eNz7fv+0nVdW1WVI4VkEEI4IB8RHjXLCg6II4TPXmbgADOTZhwQV0+F4ekPmDBzcQ2zTcKEC9+wXTqbhE3CJrGyd5jpp1jDxb0SNgm7dNawNbyqhudlydkBUkwG4irCU0rzsa6bVqt0BinFN44vEX7EGDfIiHOj/Hfr8wvCZ0/Xf6TpeQAAAABJRU5ErkJggg=="/><element name="divider" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAgCAYAAAA1zNleAAAAD0lEQVQoU2NgGAWjADcAAAIgAAEeEYatAAAAAElFTkSuQmCC"/></elements></component><component name="playlist"><settings><setting name="backgroundcolor" value="0x3c3c3e"/><setting name="fontcolor" value="0x848489"/><setting name="fontsize" value="11"/><setting name="fontweight" value="normal"/><setting name="activecolor" value="0xb2b2b6"/><setting name="overcolor" value="0xb2b2b6"/><setting name="titlecolor" value="0xb9b9be"/><setting name="titlesize" value="12"/><setting name="titleweight" value="bold"/><setting name="titleactivecolor" value="0xececf4"/><setting name="titleovercolor" value="0xececf4"/></settings><elements><element name="item" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABMAQMAAAASt2oTAAAAA1BMVEU8PD44mUV6AAAAFklEQVR4AWMYMmAUjIJRMApGwSgYBQAHuAABIqNCjAAAAABJRU5ErkJggg=="/><element name="itemActive" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABMAQMAAAASt2oTAAAAA1BMVEUvLzHXqQRQAAAAFklEQVR4AWMYMmAUjIJRMApGwSgYBQAHuAABIqNCjAAAAABJRU5ErkJggg=="/><element name="itemImage" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAA2CAMAAAAPkWzgAAAAk1BMVEU0NDcVFRcWFhgXFxknJyozMzYyMjUlJSgrKy4jIyYZGRssLC8YGBobGx0kJCcuLjAiIiQaGhwjIyUpKSwkJCYaGh0nJykiIiUgICIwMDMqKi0cHB8lJScdHSAtLTAuLjEdHR8VFRgxMTQvLzIvLzEoKCsZGRwqKiwbGx4gICMoKCofHyImJigmJikhISMeHiAhISRWJqoOAAAA/klEQVR4Ae3VNYLDMBQG4X8kme2QwwzLfP/TbeO0qfQ6zQW+coRxQqYl4HEJSEACEvA8NQamRkCoF40kNUxMgC3gc0lrtiZAB1BKuSOPDIzcXroB0EtL3hQXuIHLNboDC+aRgRnQ6GUAjtBEBmrgdcwA/OCyuMATraOvBiB3HBQTOJ8KZp5QwwXoA3xFBdrVjpPnHVgBfQfjqMChZSoAugDMwCsqUMFeAHwEwMFnXKDkshGAz5YAEOIC2fpbAqhUAMDG4AcO3HUAahkAHYykOQATC6Bsf7M7UNotswLwmR2wAviTHVAAHA2BMXCWIaDC7642wIMSkIAEJCABxv0D1B4Kmtm5dvAAAAAASUVORK5CYII="/><element name="divider" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAAABCAIAAAAkUWeUAAAAEUlEQVR42mPQ1zccRaOIzggAmuR1T+nadMkAAAAASUVORK5CYII="/><element name="sliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAABCAYAAADErm6rAAAAHklEQVQI12NgIABERcX/Kymp/FdWVkXBIDGQHCH9AAmVCvfMHD66AAAAAElFTkSuQmCC"/><element name="sliderCapTop" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAKCAYAAACuaZ5oAAAAEUlEQVQoU2NgGAWjYBQMfQAAA8oAAZphnjsAAAAASUVORK5CYII="/><element name="sliderCapBottom" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAKCAYAAACuaZ5oAAAAEUlEQVQoU2NgGAWjYBQMfQAAA8oAAZphnjsAAAAASUVORK5CYII="/><element name="sliderRailCapTop" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAECAYAAACUY/8YAAAAX0lEQVR42q2P4QqAIAyEewktLUy3pKevVwvpAdZO+q9Qgw+OO25jQ88YM2blUAp4dW71epfvyuXcLCGsFWh4yD4fsHY6vV8kRpKUGFQND9kfHxQsJNqEOYOq4Wl2t/oPXdoiX8vd60IAAAAASUVORK5CYII="/><element name="sliderRailCapBottom" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAECAYAAACUY/8YAAAAXElEQVQY02NgIADExCQ+KSmp/FdWVkXBIDGg3BcGSoG0tMxGWVl5DAtAYiA5ii2wsbE1ALr0A8hAkKtBGMQGiYHkKLbg////TK6uboYg1wIN/QzCIDZIDCRHSD8AB2YrZ5n2CLAAAAAASUVORK5CYII="/><element name="sliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAABCAAAAADhxTF3AAAAAnRSTlMA/1uRIrUAAAAUSURBVHjaY/oPA49unT+yaz2cCwAcKhapymVMMwAAAABJRU5ErkJggg=="/><element name="sliderThumbCapBottom" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAECAQAAAA+ajeTAAAAMElEQVQI12NgwACPPt76f/7/kf+7/q//yEAMeNQH19DHQBy41Xf+/ZH3u4hVjh8AAJAYGojU8tLHAAAAAElFTkSuQmCC"/><element name="sliderThumbCapTop" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAECAQAAAA+ajeTAAAANUlEQVQI12NgoAbY2rf+49KPs/uIVH54wrH/h/7v+L/y//QJRGm4/PHa/7NALdv+L/6MKQsAZV8ZczFGWjAAAAAASUVORK5CYII="/></elements></component><component name="tooltip"><settings><setting name="fontcase" value="normal"/><setting name="fontcolor" value="0xacacac"/><setting name="fontsize" value="11"/><setting name="fontweight" value="normal"/><setting name="activecolor" value="0xffffff"/><setting name="overcolor" value="0xffffff"/></settings><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAACCAYAAABsfz2XAAAAEUlEQVR4AWOwtnV8RgomWQMAWvcm6W7AcF8AAAAASUVORK5CYII="/><element name="arrow" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAADCAYAAACnI+4yAAAAEklEQVR42mP4//8/AymYgeYaABssa5WUTzsyAAAAAElFTkSuQmCC"/><element name="capTop" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAECAYAAAC6Jt6KAAAAHUlEQVR42mMUFRU/wUACYHR1935GkgZrW0faagAAqHQGCWgiU9QAAAAASUVORK5CYII="/><element name="capBottom" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAECAYAAAC6Jt6KAAAAGElEQVR42mOwtnV8RgpmoL0GUVHxE6RgAO7IRsl4Cw8cAAAAAElFTkSuQmCC"/><element name="capLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAACCAYAAACUn8ZgAAAAFklEQVR42mMQFRU/YW3r+AwbZsAnCQBUPRWHq8l/fAAAAABJRU5ErkJggg=="/><element name="capRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAACCAYAAACUn8ZgAAAAFklEQVR42mOwtnV8hg2LioqfYMAnCQBwXRWHw2Rr1wAAAABJRU5ErkJggg=="/><element name="capTopLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAECAYAAABCxiV9AAAAPklEQVR4XmMQFRVnBeIiIN4FxCeQMQOQU6ijq3/VycXjiau79zNkDJLcZWvv9MTGzumZta0jCgZJnkAXhPEBnhkmTDF7/FAAAAAASUVORK5CYII="/><element name="capTopRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAECAYAAABCxiV9AAAAPklEQVR42mMQFRU/gYZ3A3ERELMyuLp7P0PGTi4eT3R09a8CJbMYrG0dnyFjGzunZ7b2Tk+AkrswJGEYZAUA8XwmRnLnEVMAAAAASUVORK5CYII="/><element name="capBottomLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAECAYAAABCxiV9AAAAMUlEQVR4AWMQFRU/YW3r+AwbBknusrSye4JLslBdQ/uqpbX9E2ySrEBcBMS7QVYgYwAWViWcql/T2AAAAABJRU5ErkJggg=="/><element name="capBottomRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAECAYAAABCxiV9AAAANUlEQVR42mOwtnV8hg2LioqfYMAmYWll9wQouQtD0tLa/om6hvZVoGQ2A0g7Gt4NxEVAzAoAZzolltlSH50AAAAASUVORK5CYII="/><element name="menuOption" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAARCAYAAADkIz3lAAAAcklEQVQoz2NgGLFAVFRcDoh3AfFnKC2HVaGYmMQeSUnp/7Kycv9BNJB/AJeJn+XlFf8rKir/V1BQ+g/k/8SqEGjKPhkZuf/Kyqr/QTSQfwirQm9vX3WQYqCVX0G0p6e3BlaF////ZwJiLiDmgdJMwzr2ANEWKw6VGUzBAAAAAElFTkSuQmCC"/><element name="menuOptionOver" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAARCAYAAADkIz3lAAAAcklEQVQoz2NgGLFAVFRcDoh3AfFnKC2HVaGYmMQeSUnp/7Kycv9BNJB/AJeJn+XlFf8rKir/V1BQ+g/k/8SqEGjKPhkZuf/Kyqr/QTSQfwirQm9vX3WQYqCVX0G0p6e3BlaF////ZwJiLiDmgdJMwzr2ANEWKw6VGUzBAAAAAElFTkSuQmCC"/><element name="menuOptionActive" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAARCAQAAABOKvVuAAAAdElEQVR4AWOgJ5BhcGQIBWIZhJCsW+6jS7+/P7rklssgBxN0un/59f+n/1//f3SVwQUmGPrs+6P/IPj8N0M4TNBl/+Vr/0Hw4FUGN5igkm3ursvnf+y6bJ/LoAwTZGZQY/BgCANiNSCbASHMwcANxMy09DcAxqMsxkMxUYIAAAAASUVORK5CYII="/><element name="volumeCapTop" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAFCAYAAAB1j90SAAAAE0lEQVR42mP4//8/AzmYYQRoBADgm9EvDrkmuwAAAABJRU5ErkJggg=="/><element name="volumeCapBottom" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAFCAYAAAB1j90SAAAAE0lEQVR42mP4//8/AzmYYQRoBADgm9EvDrkmuwAAAABJRU5ErkJggg=="/><element name="volumeRailCapTop" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAECAYAAAC+0w63AAAAXklEQVR42n2NWwqAIBRE3YSmJT4KafW1tZAWMN2RPkSojwPDPO5VAFSP1lMRDqG+UJexN4524bJ2hvehQU2P2efQGHs6tyCEhBhzg5oes7+PlcWUVuS8Nah5QLK77z7Bcm/CZuJM1AAAAABJRU5ErkJggg=="/><element name="volumeRailCapBottom" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAECAYAAAC+0w63AAAAWklEQVQI12NgQAJiYhKfVFXV/6upaaBgkBhQ7gsDLiAtLbNRXl4RQyNIDCSHU6ONja0B0OQPIIUgW0AYxAaJgeRwavz//z+Tq6ubIch0oOLPIAxig8RAcshqARVfK+sjJ8UzAAAAAElFTkSuQmCC"/><element name="volumeRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAA0CAYAAAC6qQkaAAAAXklEQVR42mP5//8/AwyIiUn85+bmZmBkZGRABiA1X79+ZXj16gVcgoUBDaBrwiWGoZFYMCg0MpKnkZFxCPlxVONw0MjIyDgaOCM7AdC7lBuNjtGiY1TjqMbRwooijQBUhw3jnmCdzgAAAABJRU5ErkJggg=="/><element name="volumeProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAA0CAAAAACfwlbGAAAAAnRSTlMA/1uRIrUAAAAmSURBVHgBY/gPBPdunT+yaw2IBeY+BHHXwbmPQNz1w5w7yh3lAgBeJpPWLirUWgAAAABJRU5ErkJggg=="/><element name="volumeProgressCapTop" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAECAQAAAAU2sY8AAAANElEQVQI12NgIA5s7Vv/cenH2X1YpA5POPb/0P8d/1f+nz4BQ/Lyx2v/zwKlt/1f/BkmBgDJshlzy7m4BgAAAABJRU5ErkJggg=="/><element name="volumeProgressCapBottom" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAECAQAAAAU2sY8AAAAL0lEQVQI12NggIJHH2/9P///yP9d/9d/ZkAHjybCJScyYIJbE85/OvJp1wQG4gAADBkams/Cpm0AAAAASUVORK5CYII="/><element name="volumeThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAQCAQAAACMnYaxAAAA/klEQVR4AYXQoW7CUBjF8f9IYWkgq2l2k8llrmJBTOBxsyQlJENs4236CDhEywNUIEGh12WZuYDC4W9A3B2zhTVLds8VJ+fnPv5/FzQIaHGptNQaWn4ooM0DA56VgVpbi1hEk2vSvNjbozu6vc0LUi1NCQFXDBflwW/9p7L1B78oGRJJCOnN8o3/OMvGz3J6EiLStdX0K2tLKiFm8n6qY3XiVYL5C98cLxL90dLWcWkZSYjpZ0Uds4K+hIg7nqblOU1LxlojCDF0GWfz1a5ylVvtsrmoi5EQ0OGGhEdNE2WslmjpSND5VAy3mu6VRM1o0fm+Dx8SEWOUWC3UIvoCCFqphCwr/x8AAAAASUVORK5CYII="/></elements></component></components></skin>';

    var parsed;
    jwplayer.html5.defaultskin = function() {
        parsed = parsed || jwplayer.utils.parseXML(text);
        return parsed;
    };
})(jwplayer);
(function(jwplayer) {
    var html5 = jwplayer.html5,
        utils = jwplayer.utils,
        events = jwplayer.events,
        states = events.state,
        _css = utils.css,
        _isMobile = utils.isMobile(),

        D_CLASS = '.jwdisplay',
        D_PREVIEW_CLASS = '.jwpreview';

    var DEFAULT_SETTINGS = {
        showicons: true,
        bufferrotation: 45,
        bufferinterval: 100,
        fontcolor: '#ccc',
        overcolor: '#fff',
        fontsize: 15,
        fontweight: ''
    };

    html5.display = function(_api, config) {
        var _skin = _api.skin,
            _display, _preview,
            _displayTouch,
            _item,
            _image, _imageWidth, _imageHeight,
            _imageHidden = false,
            _icons = {},
            _errorState = false,
            _completedState = false,
            _hiding,
            _hideTimeout,
            _button,
            _forced,
            _previousState,
            _config = utils.extend({}, DEFAULT_SETTINGS,
                _skin.getComponentSettings('display'), config
            ),
            _eventDispatcher = new events.eventdispatcher(),
            _alternateClickHandler,
            _lastClick;

        utils.extend(this, _eventDispatcher);

        function _init() {
            _display = document.createElement('div');
            _display.id = _api.id + '_display';
            _display.className = 'jwdisplay';

            _preview = document.createElement('div');
            _preview.className = 'jwpreview jw' + _api.jwGetStretching();
            _display.appendChild(_preview);

            _api.jwAddEventListener(events.JWPLAYER_PLAYER_STATE, _stateHandler);
            _api.jwAddEventListener(events.JWPLAYER_PLAYLIST_ITEM, _itemHandler);
            _api.jwAddEventListener(events.JWPLAYER_PLAYLIST_COMPLETE, _playlistCompleteHandler);
            _api.jwAddEventListener(events.JWPLAYER_MEDIA_ERROR, _errorHandler);
            _api.jwAddEventListener(events.JWPLAYER_ERROR, _errorHandler);
            _api.jwAddEventListener(events.JWPLAYER_PROVIDER_CLICK, _clickHandler);

            if (!_isMobile) {
                _display.addEventListener('click', _clickHandler, false);
            } else {
                _displayTouch = new utils.touch(_display);
                _displayTouch.addEventListener(utils.touchEvents.TAP, _clickHandler);
            }

            _createIcons();

            _stateHandler({
                newstate: states.IDLE
            });
        }

        function _clickHandler(evt) {

            if (_alternateClickHandler && (_api.jwGetControls() || _api.jwGetState() === states.PLAYING)) {
                _alternateClickHandler(evt);
                return;
            }

            if (!_isMobile || !_api.jwGetControls()) {
                _eventDispatcher.sendEvent(events.JWPLAYER_DISPLAY_CLICK);
            }

            if (!_api.jwGetControls()) {
                return;
            }


            // Handle double-clicks for fullscreen toggle
            var currentClick = _getCurrentTime();
            if (_lastClick && currentClick - _lastClick < 500) {
                _api.jwSetFullscreen();
                _lastClick = undefined;
            } else {
                _lastClick = _getCurrentTime();
            }

            var cbBounds = utils.bounds(_display.parentNode.querySelector('.jwcontrolbar')),
                displayBounds = utils.bounds(_display),
                playSquare = {
                    left: cbBounds.left - 10 - displayBounds.left,
                    right: cbBounds.left + 30 - displayBounds.left,
                    top: displayBounds.bottom - 40,
                    bottom: displayBounds.bottom
                },
                fsSquare = {
                    left: cbBounds.right - 30 - displayBounds.left,
                    right: cbBounds.right + 10 - displayBounds.left,
                    top: playSquare.top,
                    bottom: playSquare.bottom
                };

            if (_isMobile) {
                if (_inside(playSquare, evt.x, evt.y)) {
                    // Perform play/pause toggle below
                } else if (_inside(fsSquare, evt.x, evt.y)) {
                    _api.jwSetFullscreen();
                    return;
                } else {
                    _eventDispatcher.sendEvent(events.JWPLAYER_DISPLAY_CLICK);
                    if (_hiding) {
                        return;
                    }
                }
            }

            switch (_api.jwGetState()) {
                case states.PLAYING:
                case states.BUFFERING:
                    _api.jwPause();
                    break;
                default:
                    _api.jwPlay();
                    break;
            }

        }

        function _inside(rect, x, y) {
            return (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
        }

        /** Returns the current timestamp in milliseconds **/
        function _getCurrentTime() {
            return new Date().getTime();
        }

        this.clickHandler = _clickHandler;

        function _createIcons() {
            var outStyle = {
                    font: _config.fontweight + ' ' + _config.fontsize + 'px/' +
                        (parseInt(_config.fontsize, 10) + 3) + 'px Arial, Helvetica, sans-serif',
                    color: _config.fontcolor
                },
                overStyle = {
                    color: _config.overcolor
                };
            _button = new html5.displayicon(_display.id + '_button', _api, outStyle, overStyle);
            _display.appendChild(_button.element());
        }


        function _setIcon(name, text) {
            if (!_config.showicons) {
                return;
            }

            if (name || text) {
                _button.setRotation(name === 'buffer' ? parseInt(_config.bufferrotation, 10) : 0,
                    parseInt(_config.bufferinterval, 10));
                _button.setIcon(name);
                _button.setText(text);
            } else {
                _button.hide();
            }

        }

        function _itemHandler() {
            _clearError();
            _item = _api.jwGetPlaylist()[_api.jwGetPlaylistIndex()];
            var newImage = _item ? _item.image : '';
            _previousState = undefined;
            _loadImage(newImage);
        }

        function _loadImage(newImage) {
            if (_image !== newImage) {
                if (_image) {
                    _setVisibility(D_PREVIEW_CLASS, false);
                }
                _image = newImage;
                _getImage();
            } else if (_image && !_hiding) {
                _setVisibility(D_PREVIEW_CLASS, true);
            }
            _updateDisplay(_api.jwGetState());
        }

        function _playlistCompleteHandler() {
            _completedState = true;
            _setIcon('replay');
            var item = _api.jwGetPlaylist()[0];
            _loadImage(item.image);
        }

        var _stateTimeout;

        function _getState() {
            return _forced ? _forced : (_api ? _api.jwGetState() : states.IDLE);
        }

        function _stateHandler(evt) {
            clearTimeout(_stateTimeout);
            _stateTimeout = setTimeout(function() {
                _updateDisplay(evt.newstate);
            }, 100);
        }

        function _updateDisplay(state) {
            state = _getState();
            if (state !== _previousState) {
                _previousState = state;
                if (_button) {
                    _button.setRotation(0);
                }
                switch (state) {
                    case states.IDLE:
                        if (!_errorState && !_completedState) {
                            if (_image && !_imageHidden) {
                                _setVisibility(D_PREVIEW_CLASS, true);
                            }
                            var disp = true;
                            if (_api._model && _api._model.config.displaytitle === false) {
                                disp = false;
                            }
                            _setIcon('play', (_item && disp) ? _item.title : '');
                        }
                        break;
                    case states.BUFFERING:
                        _clearError();
                        _completedState = false;
                        _setIcon('buffer');
                        break;
                    case states.PLAYING:
                        _setIcon();
                        break;
                    case states.PAUSED:
                        _setIcon('play');
                        break;
                }
            }
        }


        this.forceState = function(state) {
            _forced = state;
            _updateDisplay(state);
            this.show();
        };

        this.releaseState = function(state) {
            _forced = null;
            _updateDisplay(state);
            this.show();
        };

        this.hidePreview = function(state) {
            _imageHidden = state;
            _setVisibility(D_PREVIEW_CLASS, !state);
            if (state) {
                _hiding = true;
                //_hideDisplay();
            }
        };

        this.setHiding = function() {
            _hiding = true;
        };

        this.element = function() {
            return _display;
        };

        function _internalSelector(selector) {
            return '#' + _display.id + ' ' + selector;
        }

        function _getImage() {
            if (_image) {
                // Find image size and stretch exactfit if close enough
                var img = new Image();
                img.addEventListener('load', _imageLoaded, false);
                img.src = _image;
            } else {
                _css(_internalSelector(D_PREVIEW_CLASS), {
                    'background-image': ''
                });
                _setVisibility(D_PREVIEW_CLASS, false);
                _imageWidth = _imageHeight = 0;
            }
        }

        function _imageLoaded() {
            _imageWidth = this.width;
            _imageHeight = this.height;
            _updateDisplay(_api.jwGetState());
            _redraw();
            if (_image) {
                _css(_internalSelector(D_PREVIEW_CLASS), {
                    'background-image': 'url(' + _image + ')'
                });
            }
        }

        function _errorHandler(evt) {
            _errorState = true;
            _setIcon('error', evt.message);
        }

        function _clearError() {
            _errorState = false;
            if (_icons.error) {
                _icons.error.setText();
            }
        }


        function _redraw() {
            if (_display.clientWidth * _display.clientHeight > 0) {
                utils.stretch(_api.jwGetStretching(),
                    _preview, _display.clientWidth, _display.clientHeight, _imageWidth, _imageHeight);
            }
        }

        this.redraw = _redraw;

        function _setVisibility(selector, state) {
            _css(_internalSelector(selector), {
                opacity: state ? 1 : 0,
                visibility: state ? 'visible' : 'hidden'
            });
        }

        this.show = function(force) {
            if (_button && (force || _getState() !== states.PLAYING)) {
                _clearHideTimeout();
                _display.style.display = 'block';
                _button.show();
                _hiding = false;
            }
        };

        this.hide = function() {
            if (_button) {
                _button.hide();
                _hiding = true;
            }
        };

        function _clearHideTimeout() {
            clearTimeout(_hideTimeout);
            _hideTimeout = undefined;
        }

        /** NOT SUPPORTED : Using this for now to hack around instream API **/
        this.setAlternateClickHandler = function(handler) {
            _alternateClickHandler = handler;
        };

        this.revertAlternateClickHandler = function() {
            _alternateClickHandler = null;
        };

        _init();
    };

    _css(D_CLASS, {
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
    });

    _css(D_CLASS + ' ' + D_PREVIEW_CLASS, {
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: '#000 no-repeat center',
        overflow:'hidden',
        opacity: 0
    });

    utils.transitionStyle(D_CLASS + ', ' + D_CLASS + ' *', 'opacity .25s, color .25s');

})(jwplayer);
(function(jwplayer) {
    /*jshint maxparams:5*/
    /*jshint -W069 */
    var html5 = jwplayer.html5,
        utils = jwplayer.utils,
        _css = utils.css,

        DI_CLASS = '.jwplayer .jwdisplayIcon',
        DOCUMENT = document,

        /** Some CSS constants we should use for minimization */
        JW_CSS_NONE = 'none',
        JW_CSS_100PCT = '100%',
        JW_CSS_CENTER = 'center';

    html5.displayicon = function(_id, _api, textStyle, textStyleOver) {
        var _skin = _api.skin,
            _playerId = _api.id,
            _container,
            _bgSkin,
            _capLeftSkin,
            _capRightSkin,
            _hasCaps,
            _text,
            _icon,
            _iconCache = {},
            _iconElement,
            _iconWidth = 0,
            _setWidthTimeout = -1,
            _repeatCount = 0;

        if (_api instanceof jwplayer.html5.instream) {
            _playerId = _playerId.replace('_instream', '');
        }

        function _init() {
            _container = _createElement('jwdisplayIcon');
            _container.id = _id;

            _createBackground();
            _text = _createElement('jwtext', _container, textStyle, textStyleOver);
            _icon = _createElement('jwicon', _container);

            _api.jwAddEventListener(jwplayer.events.JWPLAYER_RESIZE, _setWidth);

            _hide();
            _redraw();
        }

        function _internalSelector() {
            return '#' + _id;
        }

        function _createElement(name, parent, style, overstyle) {
            var elem = DOCUMENT.createElement('div');

            elem.className = name;
            if (parent) {
                parent.appendChild(elem);
            }

            if (_container) {
                _styleIcon(name, '.' + name, style, overstyle);
            }
            return elem;
        }

        function _createBackground() {
            _bgSkin = _getSkinElement('background');
            _capLeftSkin = _getSkinElement('capLeft');
            _capRightSkin = _getSkinElement('capRight');
            _hasCaps = (_capLeftSkin.width * _capRightSkin.width > 0);

            var style = {
                'background-image': 'url(' + _capLeftSkin.src + '), url(' +
                    _bgSkin.src + '), url(' + _capRightSkin.src + ')',
                'background-position': 'left,center,right',
                'background-repeat': 'no-repeat',
                padding: '0 ' + _capRightSkin.width + 'px 0 ' + _capLeftSkin.width + 'px',
                height: _bgSkin.height,
                'margin-top': _bgSkin.height / -2
            };
            _css(_internalSelector(), style);

            if (!utils.isMobile()) {
                if (_bgSkin.overSrc) {
                    style['background-image'] = 'url(' +
                        _capLeftSkin.overSrc + '), url(' + _bgSkin.overSrc + '), url(' + _capRightSkin.overSrc + ')';
                }
                _css('.jw-tab-focus ' + _internalSelector() +
                    ', #' + _playerId + ' .jwdisplay:hover ' + _internalSelector(), style);
            }
        }

        function _styleIcon(name, selector, style, overstyle) {
            var skinElem = _getSkinElement(name);
            if (name === 'replayIcon' && !skinElem.src) {
                skinElem = _getSkinElement('playIcon');
            }
            if (skinElem.overSrc) {
                overstyle = utils.extend({}, overstyle);
                overstyle['background-image'] = 'url(' + skinElem.overSrc + ')';
            }
            if (skinElem.src) {
                style = utils.extend({}, style);
                if (name.indexOf('Icon') > 0) {
                    _iconWidth = skinElem.width | 0;
                }
                style.width = skinElem.width;
                style['background-image'] = 'url(' + skinElem.src + ')';
                style['background-size'] = skinElem.width + 'px ' + skinElem.height + 'px';
                style['float'] = 'none';

                _css.style(_container, {
                    display: 'table'
                });
            } else {
                _css.style(_container, {
                    display: 'none'
                });
            }
            if (style) {
                _css('#' + _playerId + ' .jwdisplay ' + selector, style);
            }
            if (overstyle) {
                _css('#' + _playerId + ' .jwdisplay:hover ' + selector, overstyle);
            }
            _iconElement = skinElem;
        }

        function _getSkinElement(name) {
            var elem = _skin.getSkinElement('display', name),
                overElem = _skin.getSkinElement('display', name + 'Over');

            if (elem) {
                elem.overSrc = (overElem && overElem.src) ? overElem.src : '';
                return elem;
            }
            return {
                src: '',
                overSrc: '',
                width: 0,
                height: 0
            };
        }

        function _redraw() {
            var showText = _hasCaps || (_iconWidth === 0);

            _css.style(_text, {
                display: (_text.innerHTML && showText) ? '' : JW_CSS_NONE
            });

            _repeatCount = showText ? 30 : 0;
            _setWidth();
        }

        function _setWidth() {
            clearTimeout(_setWidthTimeout);
            if (_repeatCount-- > 0) {
                _setWidthTimeout = setTimeout(_setWidth, 33);
            }

            var px100pct = 'px ' + JW_CSS_100PCT;
            var contentWidth = Math.ceil(Math.max(_iconElement.width,
                        utils.bounds(_container).width - _capRightSkin.width - _capLeftSkin.width));
            var backgroundSize = [
                    _capLeftSkin.width + px100pct,
                    contentWidth + px100pct,
                    _capRightSkin.width + px100pct
            ].join(', ');
            var style = {
                'background-size': backgroundSize
            };
            if (_container.parentNode) {
                style.left = (_container.parentNode.clientWidth % 2 === 1) ? '0.5px' : '';
            }
            _css.style(_container, style);
        }

        this.element = function() {
            return _container;
        };

        this.setText = function(text) {
            var style = _text.style;
            _text.innerHTML = text ? text.replace(':', ':<br>') : '';
            style.height = '0';
            style.display = 'block';
            if (text) {
                while (numLines(_text) > 2) {
                    _text.innerHTML = _text.innerHTML.replace(/(.*) .*$/, '$1...');
                }
            }
            style.height = '';
            style.display = '';
            _redraw();
        };

        this.setIcon = function(name) {
            var icon = _iconCache[name];
            if (!icon) {
                icon = _createElement('jwicon');
                icon.id = _container.id + '_' + name;
                _iconCache[name] = icon;
            }
            _styleIcon(name + 'Icon', '#' + icon.id);
            if (_container.contains(_icon)) {
                _container.replaceChild(icon, _icon);
            } else {
                _container.appendChild(icon);
            }
            _icon = icon;
        };

        var _bufferInterval,
            _bufferAngle = 0,
            _currentAngle;

        function startRotation(angle, interval) {
            clearInterval(_bufferInterval);
            _currentAngle = 0;
            _bufferAngle = angle | 0;
            if (_bufferAngle === 0) {
                rotateIcon();
            } else {
                _bufferInterval = setInterval(rotateIcon, interval);
            }
        }

        function rotateIcon() {
            _currentAngle = (_currentAngle + _bufferAngle) % 360;
            utils.rotate(_icon, _currentAngle);
        }

        this.setRotation = startRotation;

        function numLines(element) {
            return Math.floor(element.scrollHeight /
                DOCUMENT.defaultView.getComputedStyle(element, null).lineHeight.replace('px', ''));
        }


        var _hide = this.hide = function() {
            _container.style.opacity = 0;
            _container.style.cursor = '';
        };

        this.show = function() {
            _container.style.opacity = 1;
            _container.style.cursor = 'pointer';
        };

        _init();
    };

    _css(DI_CLASS, {
        display: 'table',
        position: 'relative',
        'margin-left': 'auto',
        'margin-right': 'auto',
        top: '50%',
        'float': 'none'
    });

    _css(DI_CLASS + ' div', {
        position: 'relative',
        display: 'table-cell',
        'vertical-align': 'middle',
        'background-repeat': 'no-repeat',
        'background-position': JW_CSS_CENTER
    });

    _css(DI_CLASS + ' div', {
        'vertical-align': 'middle'
    }, true);

    _css(DI_CLASS + ' .jwtext', {
        color: '#fff',
        padding: '0 1px',
        'max-width': '300px',
        'overflow-y': 'hidden',
        'text-align': JW_CSS_CENTER,
        '-webkit-user-select': JW_CSS_NONE,
        '-moz-user-select': JW_CSS_NONE,
        '-ms-user-select': JW_CSS_NONE,
        'user-select': JW_CSS_NONE
    });

})(jwplayer);
/*jshint evil:true*/
(function(jwplayer) {
    var html5 = jwplayer.html5,
        utils = jwplayer.utils,
        _css = utils.css,
        _bounds = utils.bounds,
        _iFramed = (window.top !== window.self),

        D_CLASS = '.jwdock',
        DB_CLASS = '.jwdockbuttons';

    html5.dock = function(api, config) {
        var _api = api,
            _defaults = {
                iconalpha: 0.75,
                iconalphaactive: 0.5,
                iconalphaover: 1,
                margin: 8
            },
            _config = utils.extend({}, _defaults, config),
            _id = _api.id + '_dock',
            _skin = _api.skin,
            _buttonCount = 0,
            _buttons = {},
            _tooltips = {},
            _container,
            _buttonContainer,
            _dockBounds,
            _fadeTimeout,
            _this = this;

        function _init() {
            _this.visible = false;

            _container = _createElement('div', 'jwdock');
            _buttonContainer = _createElement('div', 'jwdockbuttons');
            _container.appendChild(_buttonContainer);
            _container.id = _id;

            _setupElements();

            setTimeout(function() {
                _dockBounds = _bounds(_container);
            });

        }

        function _setupElements() {
            var button = _getSkinElement('button'),
                buttonOver = _getSkinElement('buttonOver'),
                buttonActive = _getSkinElement('buttonActive');

            if (!button) {
                return;
            }

            _css(_internalSelector(), {
                height: button.height,
                padding: _config.margin
            });

            _css(DB_CLASS, {
                height: button.height
            });

            _css(_internalSelector('div.button'), utils.extend(_formatBackground(button), {
                width: button.width,
                cursor: 'pointer',
                border: 'none'
            }));

            _css(_internalSelector('div.button:hover'), _formatBackground(buttonOver));
            _css(_internalSelector('div.button:active'), _formatBackground(buttonActive));
            _css(_internalSelector('div.button>div'), {
                opacity: _config.iconalpha
            });
            _css(_internalSelector('div.button:hover>div'), {
                opacity: _config.iconalphaover
            });
            _css(_internalSelector('div.button:active>div'), {
                opacity: _config.iconalphaactive
            });
            _css(_internalSelector('.jwoverlay'), {
                top: _config.margin + button.height
            });

            _createImage('capLeft', _buttonContainer);
            _createImage('capRight', _buttonContainer);
            _createImage('divider');
        }

        function _formatBackground(elem) {
            if (!(elem && elem.src)) {
                return {};
            }
            return {
                background: 'url(' + elem.src + ') center',
                'background-size': elem.width + 'px ' + elem.height + 'px'
            };
        }

        function _createImage(className, parent) {
            var skinElem = _getSkinElement(className);
            _css(_internalSelector('.' + className), utils.extend(_formatBackground(skinElem), {
                width: skinElem.width
            }));
            return _createElement('div', className, parent);
        }

        function _internalSelector(selector) {
            return '#' + _id + ' ' + (selector ? selector : '');
        }

        function _createElement(type, name, parent) {
            var elem = document.createElement(type);
            if (name) {
                elem.className = name;
            }
            if (parent) {
                parent.appendChild(elem);
            }
            return elem;
        }

        function _getSkinElement(name) {
            var elem = _skin.getSkinElement('dock', name);
            return elem ? elem : {
                width: 0,
                height: 0,
                src: ''
            };
        }

        _this.redraw = function() {
            _dockBounds = _bounds(_container);
        };

        function _iFramedFullscreenIE() {
            return (_iFramed && utils.isIE() && _api.jwGetFullscreen());
        }

        function _positionTooltip(name) {
            var tooltip = _tooltips[name],
                tipBounds,
                button = _buttons[name],
                dockBounds,
                buttonBounds = _bounds(button.icon);

            tooltip.offsetX(0);
            dockBounds = _bounds(_container);
            if (_iFramedFullscreenIE()) {
                _css('#' + tooltip.element().id, {
                    left: buttonBounds.left*100 + 50 + buttonBounds.width*100 / 2
                });
            } else {
                _css('#' + tooltip.element().id, {
                    left: buttonBounds.left - dockBounds.left + buttonBounds.width / 2
                });
            }
            tipBounds = _bounds(tooltip.element());
            if (dockBounds.left > tipBounds.left) {
                tooltip.offsetX(dockBounds.left - tipBounds.left + 8);
            }

        }

        _this.element = function() {
            return _container;
        };

        _this.offset = function(offset) {
            _css(_internalSelector(), {
                'margin-left': offset
            });
        };

        _this.hide = function() {
            if (!_this.visible) {
                return;
            }
            _this.visible = false;
            _container.style.opacity = 0;
            clearTimeout(_fadeTimeout);
            _fadeTimeout = setTimeout(function() {
                _container.style.display = 'none';
            }, 250);
        };

        _this.showTemp = function() {
            if (!_this.visible) {
                _container.style.opacity = 0;
                _container.style.display = 'block';
            }
        };

        _this.hideTemp = function() {
            if (!_this.visible) {
                _container.style.display = 'none';
            }
        };

        _this.show = function() {
            if (_this.visible || !_buttonCount) {
                return;
            }
            _this.visible = true;
            _container.style.display = 'block';
            clearTimeout(_fadeTimeout);
            _fadeTimeout = setTimeout(function() {
                _container.style.opacity = 1;
            }, 0);
        };

        _this.addButton = function(url, label, clickHandler, id) {
            // Can't duplicate button ids
            if (_buttons[id]) {
                return;
            }

            var divider = _createElement('div', 'divider', _buttonContainer),
                newButton = _createElement('div', 'button', _buttonContainer),
                icon = _createElement('div', null, newButton);

            icon.id = _id + '_' + id;
            icon.innerHTML = '&nbsp;';
            _css('#' + icon.id, {
                'background-image': url
            });

            if (typeof clickHandler === 'string') {
                clickHandler = new Function(clickHandler);
            }
            if (!utils.isMobile()) {
                newButton.addEventListener('click', function(evt) {
                    clickHandler(evt);
                    evt.preventDefault();
                });
            } else {
                var buttonTouch = new utils.touch(newButton);
                buttonTouch.addEventListener(utils.touchEvents.TAP, function(evt) {
                    clickHandler(evt);
                });
            }

            _buttons[id] = {
                element: newButton,
                label: label,
                divider: divider,
                icon: icon
            };

            if (label) {
                var tooltip = new html5.overlay(icon.id + '_tooltip', _skin, true),
                    tipText = _createElement('div');
                tipText.id = icon.id + '_label';
                tipText.innerHTML = label;
                _css('#' + tipText.id, {
                    padding: 3
                });
                tooltip.setContents(tipText);

                if (!utils.isMobile()) {
                    var timeout;
                    newButton.addEventListener('mouseover', function() {
                        clearTimeout(timeout);
                        _positionTooltip(id);
                        tooltip.show();
                        utils.foreach(_tooltips, function(i, tooltip) {
                            if (i !== id) {
                                tooltip.hide();
                            }
                        });
                    }, false);
                    newButton.addEventListener('mouseout', function() {
                        timeout = setTimeout(tooltip.hide, 100);
                    }, false);

                    _container.appendChild(tooltip.element());
                    _tooltips[id] = tooltip;
                }
            }

            _buttonCount++;
            _setCaps();
        };

        _this.removeButton = function(id) {
            if (_buttons[id]) {
                _buttonContainer.removeChild(_buttons[id].element);
                _buttonContainer.removeChild(_buttons[id].divider);
                var tooltip = document.getElementById('' + _id + '_' + id + '_tooltip');
                if (tooltip) {
                    _container.removeChild(tooltip);
                }
                delete _buttons[id];
                _buttonCount--;
                _setCaps();
            }
        };

        _this.numButtons = function() {
            return _buttonCount;
        };

        function _setCaps() {
            _css(DB_CLASS + ' .capLeft, ' + DB_CLASS + ' .capRight', {
                display: _buttonCount ? 'block' : 'none'
            });
        }

        _init();
    };

    _css(D_CLASS, {
        opacity: 0,
        display: 'none'
    });

    _css(D_CLASS + ' > *', {
        height: '100%',
        'float': 'left'
    });

    _css(D_CLASS + ' > .jwoverlay', {
        height: 'auto',
        'float': 'none',
        'z-index': 99
    });

    _css(DB_CLASS + ' div.button', {
        position: 'relative'
    });

    _css(DB_CLASS + ' > *', {
        height: '100%',
        'float': 'left'
    });

    _css(DB_CLASS + ' .divider', {
        display: 'none'
    });

    _css(DB_CLASS + ' div.button ~ .divider', {
        display: 'block'
    });

    _css(DB_CLASS + ' .capLeft, ' + DB_CLASS + ' .capRight', {
        display: 'none'
    });

    _css(DB_CLASS + ' .capRight', {
        'float': 'right'
    });

    _css(DB_CLASS + ' div.button > div', {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        margin: 5,
        position: 'absolute',
        'background-position': 'center',
        'background-repeat': 'no-repeat'
    });

    utils.transitionStyle(D_CLASS, 'background .25s, opacity .25s');
    utils.transitionStyle(D_CLASS + ' .jwoverlay', 'opacity .25s');
    utils.transitionStyle(DB_CLASS + ' div.button div', 'opacity .25s');

})(jwplayer);
/** 
 * API to control instream playback without interrupting currently playing video
 *
 * @author pablo
 * @version 6.0
 */
(function(jwplayer) {
    var html5 = jwplayer.html5,
        _utils = jwplayer.utils,
        _ = jwplayer._,
        _events = jwplayer.events,
        _states = _events.state,
        _playlist = jwplayer.playlist;

    html5.instream = function(_api, _model, _view, _controller) {
        var _defaultOptions = {
            controlbarseekable: 'never',
            controlbarpausable: true,
            controlbarstoppable: true,
            loadingmessage: 'Loading ad',
            playlistclickable: true,
            skipoffset: null,
            tag: null
        };

        var _item,
            _array, // the copied in playlist
            _arrayIndex = 0,
            _optionList,
            _options = { // these are for before load
                controlbarseekable: 'never',
                controlbarpausable: false,
                controlbarstoppable: false
            },
            _skipButton,
            _video,
            _oldpos,
            _oldstate,
            _olditem,
            _adModel,
            _provider,
            _cbar,
            _instreamDisplay,
            _instreamContainer,
            _completeTimeoutId = -1,
            _this = _utils.extend(this, new _events.eventdispatcher());

        // Listen for player resize events
        _api.jwAddEventListener(_events.JWPLAYER_RESIZE, _resize);
        _api.jwAddEventListener(_events.JWPLAYER_FULLSCREEN, _fullscreenHandler);

        /*****************************************
         *****  Public instream API methods  *****
         *****************************************/

        _this.init = function() {

            /** Blocking playback and show Instream Display **/

            // Make sure the original player's provider stops broadcasting events (pseudo-lock...)
            _video = _controller.detachMedia();

            // Create (or reuse) video media provider
            _setupProvider();

            // Initialize the instream player's model copied from main player's model
            _adModel = new html5.model({}, _provider);
            _adModel.setVolume(_model.volume);
            _adModel.setFullscreen(_model.fullscreen);
            _adModel.setMute(_model.mute);
            _adModel.addEventListener('fullscreenchange',_nativeFullscreenHandler);
            _olditem = _model.playlist[_model.item];

            // Keep track of the original player state
            _oldpos = _video.currentTime;

            if ( _controller.checkBeforePlay() || (_oldpos === 0 && !_model.getVideo().checkComplete()) ) {
                // make sure video restarts after preroll
                _oldpos = 0;
                _oldstate = _states.PLAYING;
            } else if (_model.getVideo().checkComplete()) {
                 // AKA  postroll
                 _oldstate = _states.IDLE;
             }  else if (_api.jwGetState() === _states.IDLE) {
                _oldstate = _states.IDLE;
            } else {
                _oldstate = _states.PLAYING;
            }

            // If the player's currently playing, pause the video tag
            if (_oldstate === _states.PLAYING) {
                _video.pause();
            }

            // Instream display
            _instreamDisplay = new html5.display(_this);
            _instreamDisplay.forceState(_states.BUFFERING);
            // Create the container in which the controls will be placed
            _instreamContainer = document.createElement('div');
            _instreamContainer.id = _this.id + '_instream_container';
            _utils.css.style(_instreamContainer, {
                width: '100%',
                height: '100%'
            });

            _instreamContainer.appendChild(_instreamDisplay.element());

            // Instream controlbar
            var cbarConfig = {
                fullscreen : _model.fullscreen
            };
            _cbar = new html5.controlbar(_this, cbarConfig);
            _cbar.instreamMode(true);
            _instreamContainer.appendChild(_cbar.element());

            if (_api.jwGetControls()) {
                _cbar.show();
                _instreamDisplay.show();
            } else {
                _cbar.hide();
                _instreamDisplay.hide();
            }

            // Show the instream layer
            _view.setupInstream(_instreamContainer, _cbar, _instreamDisplay, _adModel);

            // Resize the instream components to the proper size
            _resize();

            _this.jwInstreamSetText(_defaultOptions.loadingmessage);
        };

        /** Load an instream item and initialize playback **/
        _this.load = function(item, options) {
            if (_utils.isAndroid(2.3)) {
                errorHandler({
                    type: _events.JWPLAYER_ERROR,
                    message: 'Error loading instream: Cannot play instream on Android 2.3'
                });
                return;
            }
            _sendEvent(_events.JWPLAYER_PLAYLIST_ITEM, {
                index: _arrayIndex
            }, true);

            var instreamLayer = _instreamContainer.parentNode;
            var bottom = 10 + _utils.bounds(instreamLayer).bottom - _utils.bounds(_cbar.element()).top;

            // Copy the playlist item passed in and make sure it's formatted as a proper playlist item
            if (_.isArray(item)) {
                if (options) {
                    _optionList = options;
                    options = options[_arrayIndex];
                }
                _array = item;
                item = _array[_arrayIndex];
            }
            _options = _utils.extend(_defaultOptions, options);
            _item = new _playlist.item(item);
            _adModel.setPlaylist([item]);
            _skipButton = new html5.adskipbutton(_api.id, bottom, _options.skipMessage, _options.skipText);
            _skipButton.addEventListener(_events.JWPLAYER_AD_SKIPPED, _skipAd);
            _skipButton.reset(_options.skipoffset || -1);


            if (_api.jwGetControls()) {
                _skipButton.show();
            } else {
                _skipButton.hide();
            }


            var skipElem = _skipButton.element();
            _instreamContainer.appendChild(skipElem);
            // Match the main player's controls state
            _adModel.addEventListener(_events.JWPLAYER_ERROR, errorHandler);

            // start listening for ad click
            _instreamDisplay.setAlternateClickHandler(function(evt) {
                evt = evt || {};
                evt.hasControls = !!_api.jwGetControls();

                _sendEvent(_events.JWPLAYER_INSTREAM_CLICK, evt);

                // toggle playback after click event

                if (_adModel.state === _states.PAUSED) {
                    if (evt.hasControls) {
                        _this.jwInstreamPlay();
                    }
                } else {
                    _this.jwInstreamPause();
                }
            });

            if (_utils.isMSIE()) {
                _video.parentElement.addEventListener('click', _instreamDisplay.clickHandler);
            }

            _view.addEventListener(_events.JWPLAYER_AD_SKIPPED, _skipAd);

            // Load the instream item
            _provider.load(_adModel.playlist[0]);
            //_fakemodel.getVideo().addEventListener('webkitendfullscreen', _fullscreenChangeHandler, FALSE);
        };

        function errorHandler(evt) {
            _sendEvent(evt.type, evt);

            if (_adModel) {
                _api.jwInstreamDestroy(false, _this);
            }
        }

        /** Stop the instream playback and revert the main player back to its original state **/
        _this.jwInstreamDestroy = function(complete) {
            if (!_adModel) {
                return;
            }
            _adModel.removeEventListener('fullscreenchange',_nativeFullscreenHandler);
            clearTimeout(_completeTimeoutId);
            _completeTimeoutId = -1;
            _provider.detachMedia();
            // Re-attach the controller
            _controller.attachMedia();
            // Load the original item into our provider, which sets up the regular player's video tag
            if (_oldstate !== _states.IDLE) {
                var item = _utils.extend({}, _olditem);
                item.starttime = _oldpos;
                _model.getVideo().load(item);

            } else {
                _model.getVideo().stop();
            }
            _this.resetEventListeners();

            // We don't want the instream provider to be attached to the video tag anymore

            _provider.resetEventListeners();
            _adModel.resetEventListeners();



            // If we added the controlbar anywhere, let's get rid of it
            if (_cbar) {
                try {
                    _cbar.element().parentNode.removeChild(_cbar.element());
                } catch (e) {}
            }
            if (_instreamDisplay) {
                if (_video && _video.parentElement) {
                    _video.parentElement.removeEventListener('click', _instreamDisplay.clickHandler);
                }
                _instreamDisplay.revertAlternateClickHandler();
            }
            // Let listeners know the instream player has been destroyed, and why
            _sendEvent(_events.JWPLAYER_INSTREAM_DESTROYED, {
                reason: complete ? 'complete' : 'destroyed'
            }, true);



            if (_oldstate === _states.PLAYING) {
                // Model was already correct; just resume playback
                _video.play();
            }

            // Return the view to its normal state
            _view.destroyInstream(_provider.isAudioFile());
            _adModel = null;
        };

        /** Forward any calls to add and remove events directly to our event dispatcher **/

        _this.jwInstreamAddEventListener = function(type, listener) {
            _this.addEventListener(type, listener);
        };
        _this.jwInstreamRemoveEventListener = function(type, listener) {
            _this.removeEventListener(type, listener);
        };

        /** Start instream playback **/
        _this.jwInstreamPlay = function() {
            //if (!_item) return;
            _provider.play(true);
            _model.state = _states.PLAYING;
            _instreamDisplay.show();
            
            // if (_api.jwGetControls()) { _disp.show();  }
        };

        /** Pause instream playback **/
        _this.jwInstreamPause = function() {
            //if (!_item) return;
            _provider.pause(true);
            _model.state = _states.PAUSED;
            if (_api.jwGetControls()) {
                _instreamDisplay.show();
                _cbar.show();
            }
        };

        /** Seek to a point in instream media **/
        _this.jwInstreamSeek = function(position) {
            //if (!_item) return;
            _provider.seek(position);
        };

        /** Set custom text in the controlbar **/
        _this.jwInstreamSetText = function(text) {
            _cbar.setText(text);
        };

        _this.jwInstreamState = function() {
            //if (!_item) return;
            return _adModel.state;
        };

        /*****************************
         ****** Private methods ******
         *****************************/

        function _setupProvider() {
            var Provider = jwplayer.html5.chooseProvider({});
            
            _provider = new Provider(_model.id);

            _provider.addGlobalListener(_forward);
            _provider.addEventListener(_events.JWPLAYER_MEDIA_META, _metaHandler);
            _provider.addEventListener(_events.JWPLAYER_MEDIA_COMPLETE, _completeHandler);
            _provider.addEventListener(_events.JWPLAYER_MEDIA_BUFFER_FULL, _bufferFullHandler);
            _provider.addEventListener(_events.JWPLAYER_MEDIA_ERROR, errorHandler);

            _provider.addEventListener(_events.JWPLAYER_PLAYER_STATE, stateHandler);
            _provider.addEventListener(_events.JWPLAYER_MEDIA_TIME, function(evt) {
                if (_skipButton) {
                    _skipButton.updateSkipTime(evt.position, evt.duration);
                }
            });
            _provider.attachMedia();
            _provider.mute(_model.mute);
            _provider.volume(_model.volume);
        }

        function stateHandler(evt) {
            if (evt.newstate === _adModel.state) {
                return;
            }
            _adModel.state = evt.newstate;
            switch(_adModel.state) {
                case _states.PLAYING:
                    _this.jwInstreamPlay();
                    break;
                case _states.PAUSED:
                    _this.jwInstreamPause();
                    break;
                
            }
        }

        function _skipAd(evt) {
            _sendEvent(evt.type, evt);
            _completeHandler();
        }
        /** Forward provider events to listeners **/
        function _forward(evt) {
            _sendEvent(evt.type, evt);
        }
        
        function _nativeFullscreenHandler(evt) {
            _model.sendEvent(evt.type,evt);
            _sendEvent(_events.JWPLAYER_FULLSCREEN, {fullscreen:evt.jwstate});
        }
        function _fullscreenHandler(evt) {
            // required for updating the controlbars toggle icon
            _forward(evt);
            if (!_adModel) {
                return;
            }
            _resize();
            if (!evt.fullscreen && _utils.isIPad()) {
                if (_adModel.state === _states.PAUSED) {
                    _instreamDisplay.show(true);
                } else if (_adModel.state === _states.PLAYING) {
                    _instreamDisplay.hide();
                }
            }
        }

        /** Handle the JWPLAYER_MEDIA_BUFFER_FULL event **/
        function _bufferFullHandler() {
            if (_instreamDisplay) {
                _instreamDisplay.releaseState(_this.jwGetState());
            }
            _provider.play();
        }

        /** Handle the JWPLAYER_MEDIA_COMPLETE event **/
        function _completeHandler() {
            if (_array && _arrayIndex + 1 < _array.length) {
                _arrayIndex++;
                var item = _array[_arrayIndex];
                _item = new _playlist.item(item);
                _adModel.setPlaylist([item]);
                var curOpt;
                if (_optionList) {
                    curOpt = _optionList[_arrayIndex];
                }
                _options = _utils.extend(_defaultOptions, curOpt);
                _provider.load(_adModel.playlist[0]);
                _skipButton.reset(_options.skipoffset || -1);
                _completeTimeoutId = setTimeout(function() {
                    _sendEvent(_events.JWPLAYER_PLAYLIST_ITEM, {
                        index: _arrayIndex
                    }, true);
                }, 0);
            } else {
                _completeTimeoutId = setTimeout(function() {
                    // this is called on every ad completion of the final video in a playlist
                    //   1) vast.js (to trigger ad_complete event)
                    //   2) display.js (to set replay icon and image)
                    _sendEvent(_events.JWPLAYER_PLAYLIST_COMPLETE, {}, true);
                    _api.jwInstreamDestroy(true, _this);
                }, 0);
            }
        }

        /** Handle the JWPLAYER_MEDIA_META event **/
        function _metaHandler(evt) {
            // If we're getting video dimension metadata from the provider, allow the view to resize the media
            if (evt.width && evt.height) {
                if (_instreamDisplay) {
                    _instreamDisplay.releaseState(_this.jwGetState());
                }
                _view.resizeMedia();
            }
        }

        function _sendEvent(type, data) {
            data = data || {};
            if (_defaultOptions.tag && !data.tag) {
                data.tag = _defaultOptions.tag;
            }
            _this.sendEvent(type, data);
        }

        // Resize handler; resize the components.
        function _resize() {
            if (_cbar) {
                _cbar.redraw();
            }
            if (_instreamDisplay) {
                _instreamDisplay.redraw();
            }
        }

        _this.setControls = function(mode) {
            if (mode) {
                _skipButton.show();
            } else {
                _skipButton.hide();
            }
        };

        /**************************************
         *****  Duplicate main html5 api  *****
         **************************************/

        _this.jwPlay = function() {
            if (_options.controlbarpausable.toString().toLowerCase() === 'true') {
                _this.jwInstreamPlay();
            }
        };

        _this.jwPause = function() {
            if (_options.controlbarpausable.toString().toLowerCase() === 'true') {
                _this.jwInstreamPause();
            }
        };

        _this.jwStop = function() {
            if (_options.controlbarstoppable.toString().toLowerCase() === 'true') {
                _api.jwInstreamDestroy(false, _this);
                _api.jwStop();
            }
        };

        _this.jwSeek = function(position) {
            switch (_options.controlbarseekable.toLowerCase()) {
                case 'never':
                    return;
                case 'always':
                    _this.jwInstreamSeek(position);
                    break;
                case 'backwards':
                    if (_adModel.position > position) {
                        _this.jwInstreamSeek(position);
                    }
                    break;
            }
        };

        _this.jwSeekDrag = function(state) {
            _adModel.seekDrag(state);
        };

        _this.jwGetPosition = function() {};
        _this.jwGetDuration = function() {};
        _this.jwGetWidth = _api.jwGetWidth;
        _this.jwGetHeight = _api.jwGetHeight;
        _this.jwGetFullscreen = _api.jwGetFullscreen;
        _this.jwSetFullscreen = _api.jwSetFullscreen;
        _this.jwGetVolume = function() {
            return _model.volume;
        };
        _this.jwSetVolume = function(vol) {
            _adModel.setVolume(vol);
            _api.jwSetVolume(vol);
        };
        _this.jwGetMute = function() {
            return _model.mute;
        };
        _this.jwSetMute = function(state) {
            _adModel.setMute(state);
            _api.jwSetMute(state);
        };
        _this.jwGetState = function() {
            if (!_adModel) {
                return _states.IDLE;
            }
            return _adModel.state;
        };
        _this.jwGetPlaylist = function() {
            return [_item];
        };
        _this.jwGetPlaylistIndex = function() {
            return 0;
        };
        _this.jwGetStretching = function() {
            return _model.config.stretching;
        };
        _this.jwAddEventListener = function(type, handler) {
            _this.addEventListener(type, handler);
        };
        _this.jwRemoveEventListener = function(type, handler) {
            _this.removeEventListener(type, handler);
        };
        _this.jwSetCurrentQuality = function() {};
        _this.jwGetQualityLevels = function() {
            return [];
        };

        // for supporting api interface in html5 display
        _this.jwGetControls = function() {
            return _api.jwGetControls();
        };

        _this.skin = _api.skin;
        _this.id = _api.id + '_instream';

        return _this;
    };
})(window.jwplayer);
/**
 * JW Player logo component
 *
 * @author zach
 * @modified pablo
 * @version 6.0
 */
(function(jwplayer) {
    var utils = jwplayer.utils,
        html5 = jwplayer.html5,
        _css = utils.css,
        states = jwplayer.events.state,

        FREE = 'free',
        PRO = 'pro',
        PREMIUM = 'premium',
        ADS = 'ads',

        LINK_DEFAULT = 'http://www.longtailvideo.com/jwpabout/?a=l&v=',
        LOGO_CLASS = '.jwlogo';


    var logo = html5.logo = function(api, logoConfig) {
        var _api = api,
            _id = _api.id + '_logo',
            _settings,
            _logo,
            _defaults = logo.defaults,
            _showing = false;

        function _setup() {
            _setupConfig();
            _setupDisplayElements();
        }

        function _setupConfig() {
            var linkFlag = 'o';
            if (_api.edition) {
                linkFlag = _getLinkFlag(_api.edition());
            }

            if (linkFlag === 'o' || linkFlag === 'f') {
                _defaults.link = LINK_DEFAULT + jwplayer.version + '&m=h&e=' + linkFlag;
            }

            _settings = utils.extend({}, _defaults, logoConfig);
            _settings.hide = (_settings.hide.toString() === 'true');
        }

        function _setupDisplayElements() {
            _logo = document.createElement('img');
            _logo.className = 'jwlogo';
            _logo.id = _id;

			//去除JS水印
            //if (!_settings.file) {
                _logo.style.display = 'none';
                return;
           // }

            var positions = (/(\w+)-(\w+)/).exec(_settings.position),
                style = {},
                margin = _settings.margin;

            if (positions.length === 3) {
                style[positions[1]] = margin;
                style[positions[2]] = margin;
            } else {
                style.top = style.right = margin;
            }

            _css(_internalSelector(), style);

            _logo.src = (_settings.prefix ? _settings.prefix : '') + _settings.file;
            if (!utils.isMobile()) {
                _logo.onclick = _clickHandler;
            } else {
                var logoTouch = new utils.touch(_logo);
                logoTouch.addEventListener(utils.touchEvents.TAP, _clickHandler);
            }
        }

        this.resize = function() {};

        this.element = function() {
            return _logo;
        };

        this.offset = function(offset) {
            _css(_internalSelector(), {
                'margin-bottom': offset
            });
        };

        this.position = function() {
            return _settings.position;
        };

        this.margin = function() {
            return parseInt(_settings.margin, 10);
        };

        function _togglePlay() {
            if (_api.jwGetState() === states.IDLE || _api.jwGetState() === states.PAUSED) {
                _api.jwPlay();
            } else {
                _api.jwPause();
            }
        }

        function _clickHandler(evt) {
            if (utils.exists(evt) && evt.stopPropagation) {
                evt.stopPropagation();
            }

            if (!_showing || !_settings.link) {
                _togglePlay();
            }

            if (_showing && _settings.link) {
                _api.jwPause();
                _api.jwSetFullscreen(false);
                window.open(_settings.link, _settings.linktarget);
            }
            return;
        }

        function _getLinkFlag(edition) {
            if (edition === PRO) {
                return 'p';
            } else if (edition === PREMIUM) {
                return 'r';
            } else if (edition === ADS) {
                return 'a';
            } else if (edition === FREE) {
                return 'f';
            } else {
                return 'o';
            }
        }

        function _internalSelector(selector) {
            return '#' + _id + ' ' + (selector ? selector : '');
        }

        this.hide = function(forced) {
            if (_settings.hide || forced) {
                _showing = false;
                _logo.style.visibility = 'hidden';
                _logo.style.opacity = 0;
            }
        };

        this.show = function() {
            _showing = true;
            _logo.style.visibility = 'visible';
            _logo.style.opacity = 1;
        };

        _setup();

        return this;
    };

    logo.defaults = {
        prefix: utils.repo(),
        file: 'logo.png',
        linktarget: '_top',
        margin: 8,
        hide: false,
        position: 'top-right'
    };

    _css(LOGO_CLASS, {
        cursor: 'pointer',
        position: 'absolute'
    });

})(jwplayer);
/**
 * JW Player HTML5 overlay component
 *
 * @author pablo
 * @version 6.0
 */
(function(jwplayer) {

    var html5 = jwplayer.html5,
        utils = jwplayer.utils,
        _css = utils.css,

        MENU_CLASS = 'jwmenu',
        OPTION_CLASS = 'jwoption';

    /** HTML5 Overlay class **/
    html5.menu = function(name, id, skin, changeHandler) {
        var _id = id,
            _changeHandler = changeHandler,
            _overlay = new html5.overlay(_id + '_overlay', skin),
            _settings = utils.extend({
                fontcase: undefined,
                fontcolor: '#cccccc',
                fontsize: 11,
                fontweight: undefined,
                activecolor: '#ffffff',
                overcolor: '#ffffff'
            }, skin.getComponentSettings('tooltip')),
            _container,
            _options = [];

        function _init() {
            _container = _createElement(MENU_CLASS);
            _container.id = _id;

            var top = _getSkinElement('menuTop' + name),
                menuOption = _getSkinElement('menuOption'),
                menuOptionOver = _getSkinElement('menuOptionOver'),
                menuOptionActive = _getSkinElement('menuOptionActive');

            if (top && top.image) {
                var topImage = new Image();
                topImage.src = top.src;
                topImage.width = top.width;
                topImage.height = top.height;
                _container.appendChild(topImage);
            }

            if (menuOption) {
                var selector = '#' + id + ' .' + OPTION_CLASS;

                _css(selector, utils.extend(_formatBackground(menuOption), {
                    height: menuOption.height,
                    color: _settings.fontcolor,
                    'padding-left': menuOption.width,
                    font: _settings.fontweight + ' ' + _settings.fontsize + 'px Arial,Helvetica,sans-serif',
                    'line-height': menuOption.height,
                    'text-transform': (_settings.fontcase === 'upper') ? 'uppercase' : undefined
                }));
                _css(selector + ':hover', utils.extend(_formatBackground(menuOptionOver), {
                    color: _settings.overcolor
                }));
                _css(selector + '.active', utils.extend(_formatBackground(menuOptionActive), {
                    color: _settings.activecolor
                }));
            }
            _overlay.setContents(_container);
        }

        function _formatBackground(elem) {
            if (!(elem && elem.src)) {
                return {};
            }
            return {
                background: 'url(' + elem.src + ') no-repeat left',
                'background-size': elem.width + 'px ' + elem.height + 'px'
            };
        }

        this.element = function() {
            return _overlay.element();
        };

        this.addOption = function(label, value) {
            var option = _createElement(OPTION_CLASS, _container);
            option.id = _id + '_option_' + value;
            option.innerHTML = label;
            if (!utils.isMobile()) {
                option.addEventListener('click', _clickHandler(_options.length, value));
            } else {
                var optionTouch = new utils.touch(option);
                optionTouch.addEventListener(utils.touchEvents.TAP, _clickHandler(_options.length, value));
            }
            _options.push(option);
        };

        function _clickHandler(index, value) {
            return function() {
                // Note :: for quality levels, this will set it active before it is actually changed
                _setActive(index);
                if (_changeHandler) {
                    _changeHandler(value);
                }
            };
        }

        this.clearOptions = function() {
            while (_options.length > 0) {
                _container.removeChild(_options.pop());
            }
        };

        var _setActive = this.setActive = function(index) {
            for (var i = 0; i < _options.length; i++) {
                var option = _options[i];
                option.className = option.className.replace(' active', '');
                if (i === index) {
                    option.className += ' active';
                }
            }
        };


        function _createElement(className, parent) {
            var elem = document.createElement('div');
            if (className) {
                elem.className = className;
            }
            if (parent) {
                parent.appendChild(elem);
            }
            return elem;
        }

        function _getSkinElement(name) {
            var elem = skin.getSkinElement('tooltip', name);
            return elem ? elem : {
                width: 0,
                height: 0,
                src: undefined
            };
        }

        this.show = _overlay.show;
        this.hide = _overlay.hide;
        this.offsetX = _overlay.offsetX;
        this.positionX = _overlay.positionX;
        this.constrainX = _overlay.constrainX;

        _init();
    };

    function _class(className) {
        return '.' + className.replace(/ /g, ' .');
    }

    _css(_class(MENU_CLASS + ' ' + OPTION_CLASS), {
        cursor: 'pointer',
        'white-space': 'nowrap',
        position: 'relative'
    });

})(jwplayer);
/**
 * jwplayer.html5 model
 *
 * @author pablo
 * @version 6.0
 */
(function(jwplayer) {
    var html5 = jwplayer.html5,
        utils = jwplayer.utils,
        events = jwplayer.events;

    html5.model = function(config, defaultProvider) {
        var _model = this,
            // Video provider
            _video,
            // Saved settings
            _cookies = utils.getCookies(),
            // Sub-component configurations
            _componentConfigs = {
                controlbar: {},
                display: {}
            },
            _currentProvider = utils.noop,
            // Defaults
            _defaults = {
                autostart: false,
                controls: true,
                // debug: undefined,
                fullscreen: false,
                height: 320,
                mobilecontrols: false,
                mute: false,
                playlist: [],
                playlistposition: 'none',
                playlistsize: 180,
                playlistlayout: 'extended',
                repeat: false,
                // skin: undefined,
                stretching: utils.stretching.UNIFORM,
                width: 480,
                volume: 90
            };

        function _parseConfig(config) {
            utils.foreach(config, function(i, val) {
                config[i] = utils.serialize(val);
            });
            return config;
        }

        function _init() {
            utils.extend(_model, new events.eventdispatcher());
            _model.config = _parseConfig(utils.extend({}, _defaults, _cookies, config));
            utils.extend(_model, {
                id: config.id,
                state: events.state.IDLE,
                duration: -1,
                position: 0,
                buffer: 0
            }, _model.config);
            // This gets added later
            _model.playlist = [];
            _model.setItem(0);
        }

        var _eventMap = {};
        _eventMap[events.JWPLAYER_MEDIA_MUTE] = ['mute'];
        _eventMap[events.JWPLAYER_MEDIA_VOLUME] = ['volume'];
        _eventMap[events.JWPLAYER_PLAYER_STATE] = ['newstate->state'];
        _eventMap[events.JWPLAYER_MEDIA_BUFFER] = ['bufferPercent->buffer'];
        _eventMap[events.JWPLAYER_MEDIA_TIME] = ['position', 'duration'];

        function _videoEventHandler(evt) {
            var mappings = _eventMap[evt.type];
            if (mappings && mappings.length) {
                var _sendEvent = false;
                for (var i = 0; i < mappings.length; i++) {
                    var mapping = mappings[i];
                    var split = mapping.split('->');
                    var eventProp = split[0];
                    var stateProp = split[1] || eventProp;

                    if (_model[stateProp] !== evt[eventProp]) {
                        _model[stateProp] = evt[eventProp];
                        _sendEvent = true;
                    }
                }
                if (_sendEvent) {
                    _model.sendEvent(evt.type, evt);
                }
            } else {
                _model.sendEvent(evt.type, evt);
            }
        }


        _model.setVideoProvider = function(provider) {

            if (_video) {
                _video.removeGlobalListener(_videoEventHandler);
                var container = _video.getContainer();
                if (container) {
                    _video.remove();
                    provider.setContainer(container);
                }
            }

            _video = provider;
            _video.volume(_model.volume);
            _video.mute(_model.mute);
            _video.addGlobalListener(_videoEventHandler);
        };

        _model.destroy = function() {
            if (_video) {
                _video.removeGlobalListener(_videoEventHandler);
                _video.destroy();
            }
        };

        _model.getVideo = function() {
            return _video;
        };


        _model.seekDrag = function(state) {
            _video.seekDrag(state);
        };

        _model.setFullscreen = function(state) {
            state = !!state;
            if (state !== _model.fullscreen) {
                _model.fullscreen = state;
                _model.sendEvent(events.JWPLAYER_FULLSCREEN, {
                    fullscreen: state
                });
            }
        };

        // TODO: make this a synchronous action; throw error if playlist is empty
        _model.setPlaylist = function(playlist) {
            _model.playlist = jwplayer.playlist.filterPlaylist(playlist, _model.androidhls);
            if (_model.playlist.length === 0) {
                _model.sendEvent(events.JWPLAYER_ERROR, {
                    message: 'Error loading playlist: No playable sources found'
                });
            } else {
                _model.sendEvent(events.JWPLAYER_PLAYLIST_LOADED, {
                    playlist: jwplayer(_model.id).getPlaylist()
                });
                _model.item = -1;
                _model.setItem(0);
            }
        };

        _model.setItem = function(index) {
            var newItem;
            var repeat = false;
            if (index === _model.playlist.length || index < -1) {
                newItem = 0;
                repeat = true;
            } else if (index === -1 || index > _model.playlist.length) {
                newItem = _model.playlist.length - 1;
            } else {
                newItem = index;
            }

            if (repeat || newItem !== _model.item) {
                _model.item = newItem;
                _model.sendEvent(events.JWPLAYER_PLAYLIST_ITEM, {
                    index: _model.item
                });

                // select provider based on item source (video, youtube...)
                var item = _model.playlist[newItem];
                var source = item && item.sources && item.sources[0];
                var Provider = html5.chooseProvider(source);

                // If we are changing video providers
                if (! (_currentProvider instanceof Provider)) {
                    _currentProvider = defaultProvider || new Provider(_model.id);

                    _model.setVideoProvider(_currentProvider);
                }

                // this allows the Youtube provider to load preview images
                if (_currentProvider.init) {
                    _currentProvider.init(item);
                }
            }
        };

        _model.setVolume = function(newVol) {
            if (_model.mute && newVol > 0) {
                _model.setMute(false);
            }
            newVol = Math.round(newVol);
            if (!_model.mute) {
                utils.saveCookie('volume', newVol);
            }
            _videoEventHandler({
                type: events.JWPLAYER_MEDIA_VOLUME,
                volume: newVol
            });
            _video.volume(newVol);
        };

        _model.setMute = function(state) {
            if (!utils.exists(state)) {
                state = !_model.mute;
            }
            utils.saveCookie('mute', state);
            _videoEventHandler({
                type: events.JWPLAYER_MEDIA_MUTE,
                mute: state
            });
            _video.mute(state);
        };

        _model.componentConfig = function(name) {
            return _componentConfigs[name];
        };

        _init();
    };

})(jwplayer);
/**
 * JW Player HTML5 overlay component
 *
 * @author pablo
 * @version 6.0
 */
(function(jwplayer) {
    var html5 = jwplayer.html5,
        utils = jwplayer.utils,
        _css = utils.css,
        _setTransition = utils.transitionStyle,

        OVERLAY_CLASS = '.jwoverlay',
        CONTENTS_CLASS = 'jwcontents',

        TOP = 'top',
        BOTTOM = 'bottom',
        RIGHT = 'right',
        LEFT = 'left',
        WHITE = '#ffffff',

        _defaults = {
            fontcase: undefined,
            fontcolor: WHITE,
            fontsize: 12,
            fontweight: undefined,
            activecolor: WHITE,
            overcolor: WHITE
        };

    /** HTML5 Overlay class **/
    html5.overlay = function(id, skin, inverted) {
        var _this = this,
            _id = id,
            _skin = skin,
            _inverted = inverted,
            _container,
            _contents,
            _arrow,
            _arrowElement,
            _settings = utils.extend({}, _defaults, _skin.getComponentSettings('tooltip')),
            _borderSizes = {};

        function _init() {
            _container = _createElement(OVERLAY_CLASS.replace('.', ''));
            _container.id = _id;

            var arrow = _createSkinElement('arrow', 'jwarrow');
            _arrowElement = arrow[0];
            _arrow = arrow[1];

            _css.style(_arrowElement, {
                position: 'absolute',
                //bottom: _inverted ? undefined : -1 * _arrow.height,
                bottom: _inverted ? undefined : 0,
                top: _inverted ? 0 : undefined,
                width: _arrow.width,
                height: _arrow.height,
                left: '50%'
            });

            _createBorderElement(TOP, LEFT);
            _createBorderElement(BOTTOM, LEFT);
            _createBorderElement(TOP, RIGHT);
            _createBorderElement(BOTTOM, RIGHT);
            _createBorderElement(LEFT);
            _createBorderElement(RIGHT);
            _createBorderElement(TOP);
            _createBorderElement(BOTTOM);

            var back = _createSkinElement('background', 'jwback');
            _css.style(back[0], {
                left: _borderSizes.left,
                right: _borderSizes.right,
                top: _borderSizes.top,
                bottom: _borderSizes.bottom
            });

            _contents = _createElement(CONTENTS_CLASS, _container);
            _css(_internalSelector(CONTENTS_CLASS) + ' *', {
                color: _settings.fontcolor,
                font: _settings.fontweight + ' ' + (_settings.fontsize) + 'px Arial,Helvetica,sans-serif',
                'text-transform': (_settings.fontcase === 'upper') ? 'uppercase' : undefined
            });


            if (_inverted) {
                utils.transform(_internalSelector('jwarrow'), 'rotate(180deg)');
            }

            _css.style(_container, {
                padding: (_borderSizes.top + 1) + 'px ' + _borderSizes.right +
                    'px ' + (_borderSizes.bottom + 1) + 'px ' + _borderSizes.left + 'px'
            });

            _this.showing = false;
        }

        function _internalSelector(name) {
            return '#' + _id + (name ? ' .' + name : '');
        }

        function _createElement(className, parent) {
            var elem = document.createElement('div');
            if (className) {
                elem.className = className;
            }
            if (parent) {
                parent.appendChild(elem);
            }
            return elem;
        }


        function _createSkinElement(name, className) {
            var skinElem = _getSkinElement(name),
                elem = _createElement(className, _container);

            _css.style(elem, _formatBackground(skinElem));
            //_css(_internalSelector(className.replace(' ', '.')), _formatBackground(skinElem));

            return [elem, skinElem];

        }

        function _formatBackground(elem) {
            return {
                background: 'url(' + elem.src + ') center',
                'background-size': elem.width + 'px ' + elem.height + 'px'
            };
        }

        function _createBorderElement(dim1, dim2) {
            if (!dim2) {
                dim2 = '';
            }
            var created = _createSkinElement('cap' + dim1 + dim2, 'jwborder jw' + dim1 + (dim2 ? dim2 : '')),
                elem = created[0],
                skinElem = created[1],
                elemStyle = utils.extend(_formatBackground(skinElem), {
                    width: (dim1 === LEFT || dim2 === LEFT || dim1 === RIGHT || dim2 === RIGHT) ?
                        skinElem.width : undefined,
                    height: (dim1 === TOP || dim2 === TOP || dim1 === BOTTOM || dim2 === BOTTOM) ?
                        skinElem.height : undefined
                });


            elemStyle[dim1] = ((dim1 === BOTTOM && !_inverted) || (dim1 === TOP && _inverted)) ? _arrow.height : 0;
            if (dim2) {
                elemStyle[dim2] = 0;
            }

            _css.style(elem, elemStyle);
            //_css(_internalSelector(elem.className.replace(/ /g, '.')), elemStyle);

            var dim1style = {},
                dim2style = {},
                dims = {
                    left: skinElem.width,
                    right: skinElem.width,
                    top: (_inverted ? _arrow.height : 0) + skinElem.height,
                    bottom: (_inverted ? 0 : _arrow.height) + skinElem.height
                };
            if (dim2) {
                dim1style[dim2] = dims[dim2];
                dim1style[dim1] = 0;
                dim2style[dim1] = dims[dim1];
                dim2style[dim2] = 0;
                _css(_internalSelector('jw' + dim1), dim1style);
                _css(_internalSelector('jw' + dim2), dim2style);
                _borderSizes[dim1] = dims[dim1];
                _borderSizes[dim2] = dims[dim2];
            }
        }

        _this.element = function() {
            return _container;
        };

        _this.setContents = function(contents) {
            utils.empty(_contents);
            _contents.appendChild(contents);
        };

        _this.positionX = function(x) {
            _css.style(_container, {
                left: Math.round(x)
            });
        };

        _this.constrainX = function(containerBounds, forceRedraw) {
            if (_this.showing && containerBounds.width !== 0) {
                // reset and check bounds
                var width = _this.offsetX(0);
                if (width) {
                    if (forceRedraw) {
                        _css.unblock();
                    }
                    var bounds = utils.bounds(_container);
                    if (bounds.width !== 0) {
                        if (bounds.right > containerBounds.right) {
                            _this.offsetX(containerBounds.right - bounds.right);
                        } else if (bounds.left < containerBounds.left) {
                            _this.offsetX(containerBounds.left - bounds.left);
                        }
                    }
                }
            }
        };

        _this.offsetX = function(offset) {
            offset = Math.round(offset);
            var width = _container.clientWidth;
            if (width !== 0) {
                _css.style(_container, {
                    'margin-left': Math.round(-width / 2) + offset
                });
                _css.style(_arrowElement, {
                    'margin-left': Math.round(-_arrow.width / 2) - offset
                });
            }
            return width;
        };

        _this.borderWidth = function() {
            return _borderSizes.left;
        };

        function _getSkinElement(name) {
            var elem = _skin.getSkinElement('tooltip', name);
            if (elem) {
                return elem;
            } else {
                return {
                    width: 0,
                    height: 0,
                    src: '',
                    image: undefined,
                    ready: false
                };
            }
        }

        _this.show = function() {
            _this.showing = true;
            _css.style(_container, {
                opacity: 1,
                visibility: 'visible'
            });
        };

        _this.hide = function() {
            _this.showing = false;
            _css.style(_container, {
                opacity: 0,
                visibility: 'hidden'
            });
        };

        // Call constructor
        _init();

    };

    /*************************************************************
     * Player stylesheets - done once on script initialization;  *
     * These CSS rules are used for all JW Player instances      *
     *************************************************************/

    _css(OVERLAY_CLASS, {
        position: 'absolute',
        visibility: 'hidden',
        opacity: 0
    });

    _css(OVERLAY_CLASS + ' .jwcontents', {
        position: 'relative',
        'z-index': 1
    });

    _css(OVERLAY_CLASS + ' .jwborder', {
        position: 'absolute',
        'background-size': '100%' + ' ' + '100%'
    }, true);

    _css(OVERLAY_CLASS + ' .jwback', {
        position: 'absolute',
        'background-size': '100%' + ' ' + '100%'
    });

    _setTransition(OVERLAY_CLASS, 'opacity .25s, visibility .25s');

})(jwplayer);
/**
 * Main HTML5 player class
 *
 * @author pablo
 * @version 6.0
 */
(function(jwplayer) {
    var html5 = jwplayer.html5,
        utils = jwplayer.utils;

    html5.player = function(config) {
        var _this = this,
            _model,
            _view,
            _controller,
            _setup,
            _instreamPlayer;

        function _init() {
            _model = new html5.model(config);
            _this.id = _model.id;
            _this._model = _model;

            utils.css.block(_this.id);

            _view = new html5.view(_this, _model);
            _controller = new html5.controller(_model, _view);


            _initializeAPI();
            _this.initializeAPI = _initializeAPI;

            _setup = new html5.setup(_model, _view);
            _setup.addEventListener(jwplayer.events.JWPLAYER_READY, _readyHandler);
            _setup.addEventListener(jwplayer.events.JWPLAYER_ERROR, _setupErrorHandler);
            _setup.start();
        }

        function _readyHandler(evt) {
            _controller.playerReady(evt);
            utils.css.unblock(_this.id);
        }
        
        function _setupErrorHandler(evt) {
            utils.css.unblock(_this.id);
            jwplayer(_this.id).dispatchEvent(jwplayer.events.JWPLAYER_SETUP_ERROR, evt);
        }

        function _normalizePlaylist() {
            var list = _model.playlist,
                arr = [];

            for (var i = 0; i < list.length; i++) {
                arr.push(_normalizePlaylistItem(list[i]));
            }

            return arr;
        }

        function _normalizePlaylistItem(item) {
            var obj = {
                'description': item.description,
                'file': item.file,
                'image': item.image,
                'mediaid': item.mediaid,
                'title': item.title
            };

            utils.foreach(item, function(i, val) {
                obj[i] = val;
            });

            obj.sources = [];
            obj.tracks = [];
            if (item.sources.length > 0) {
                utils.foreach(item.sources, function(i, source) {
                    var sourceCopy = {
                        file: source.file,
                        type: source.type ? source.type : undefined,
                        label: source.label,
                        'default': source['default'] ? true : false
                    };
                    obj.sources.push(sourceCopy);
                });
            }

            if (item.tracks.length > 0) {
                utils.foreach(item.tracks, function(i, track) {
                    var trackCopy = {
                        file: track.file,
                        kind: track.kind ? track.kind : undefined,
                        label: track.label,
                        'default': track['default'] ? true : false
                    };
                    obj.tracks.push(trackCopy);
                });
            }

            if (!item.file && item.sources.length > 0) {
                obj.file = item.sources[0].file;
            }

            return obj;
        }

        function _initializeAPI() {

            /** Methods **/
            _this.jwPlay = _controller.play;
            _this.jwPause = _controller.pause;
            _this.jwStop = _controller.stop;
            _this.jwSeek = _controller.seek;
            _this.jwSetVolume = _controller.setVolume;
            _this.jwSetMute = _controller.setMute;
            _this.jwLoad = _controller.load;
            _this.jwPlaylistNext = _controller.next;
            _this.jwPlaylistPrev = _controller.prev;
            _this.jwPlaylistItem = _controller.item;
            _this.jwSetFullscreen = _controller.setFullscreen;
            _this.jwResize = _view.resize;
            _this.jwSeekDrag = _model.seekDrag;
            _this.jwGetQualityLevels = _controller.getQualityLevels;
            _this.jwGetCurrentQuality = _controller.getCurrentQuality;
            _this.jwSetCurrentQuality = _controller.setCurrentQuality;
            _this.jwGetAudioTracks = _controller.getAudioTracks;
            _this.jwGetCurrentAudioTrack = _controller.getCurrentAudioTrack;
            _this.jwSetCurrentAudioTrack = _controller.setCurrentAudioTrack;
            _this.jwGetCaptionsList = _controller.getCaptionsList;
            _this.jwGetCurrentCaptions = _controller.getCurrentCaptions;
            _this.jwSetCurrentCaptions = _controller.setCurrentCaptions;

            _this.jwGetSafeRegion = _view.getSafeRegion;
            _this.jwForceState = _view.forceState;
            _this.jwReleaseState = _view.releaseState;

            _this.jwGetPlaylistIndex = _statevarFactory('item');
            _this.jwGetPosition = _statevarFactory('position');
            _this.jwGetDuration = _statevarFactory('duration');
            _this.jwGetBuffer = _statevarFactory('buffer');
            _this.jwGetWidth = _statevarFactory('width');
            _this.jwGetHeight = _statevarFactory('height');
            _this.jwGetFullscreen = _statevarFactory('fullscreen');
            _this.jwGetVolume = _statevarFactory('volume');
            _this.jwGetMute = _statevarFactory('mute');
            _this.jwGetState = _statevarFactory('state');
            _this.jwGetStretching = _statevarFactory('stretching');
            _this.jwGetPlaylist = _normalizePlaylist;
            _this.jwGetControls = _statevarFactory('controls');

            /** InStream API **/
            _this.jwDetachMedia = _controller.detachMedia;
            _this.jwAttachMedia = _controller.attachMedia;

            /** Ads API **/
            _this.jwPlayAd = function(ad) {
                // THIS SHOULD NOT BE USED!
                var plugins = jwplayer(_this.id).plugins;
                if (plugins.vast) {
                    plugins.vast.jwPlayAd(ad);
                } //else if (plugins.googima) {
                //   // This needs to be added once the googima Ads API is implemented
                //plugins.googima.jwPlayAd(ad);
                //not supporting for now
                //}
            };

            _this.jwPauseAd = function() {
                var plugins = jwplayer(_this.id).plugins;
                if (plugins.googima) {
                    plugins.googima.jwPauseAd();
                }
            };

            _this.jwDestroyGoogima = function() {
                var plugins = jwplayer(_this.id).plugins;
                if (plugins.googima) {
                    plugins.googima.jwDestroyGoogima();
                }
            };

            _this.jwInitInstream = function() {
                _this.jwInstreamDestroy();
                _instreamPlayer = new html5.instream(_this, _model, _view, _controller);
                _instreamPlayer.init();
            };

            _this.jwLoadItemInstream = function(item, options) {
                if (!_instreamPlayer) {
                    throw 'Instream player undefined';
                }
                _instreamPlayer.load(item, options);
            };

            _this.jwLoadArrayInstream = function(item, options) {
                if (!_instreamPlayer) {
                    throw 'Instream player undefined';
                }
                _instreamPlayer.load(item, options);
            };

            _this.jwSetControls = function(mode) {
                _view.setControls(mode);
                if (_instreamPlayer) {
                    _instreamPlayer.setControls(mode);
                }
            };

            _this.jwInstreamPlay = function() {
                if (_instreamPlayer) {
                    _instreamPlayer.jwInstreamPlay();
                }
            };

            _this.jwInstreamPause = function() {
                if (_instreamPlayer) {
                    _instreamPlayer.jwInstreamPause();
                }
            };

            _this.jwInstreamState = function() {
                if (_instreamPlayer) {
                    return _instreamPlayer.jwInstreamState();
                }
                return '';
            };

            _this.jwInstreamDestroy = function(complete, _instreamInstance) {
                _instreamInstance = _instreamInstance || _instreamPlayer;
                if (_instreamInstance) {
                    _instreamInstance.jwInstreamDestroy(complete || false);
                    if (_instreamInstance === _instreamPlayer) {
                        _instreamPlayer = undefined;
                    }
                }
            };

            _this.jwInstreamAddEventListener = function(type, listener) {
                if (_instreamPlayer) {
                    _instreamPlayer.jwInstreamAddEventListener(type, listener);
                }
            };

            _this.jwInstreamRemoveEventListener = function(type, listener) {
                if (_instreamPlayer) {
                    _instreamPlayer.jwInstreamRemoveEventListener(type, listener);
                }
            };

            _this.jwPlayerDestroy = function() {

                if (_controller) {
                    _controller.stop();
                }
                if (_view) {
                    _view.destroy();
                }
                if (_model) {
                    _model.destroy();
                }
                if (_setup) {
                    _setup.resetEventListeners();
                    _setup.destroy();
                }
            };

            _this.jwInstreamSetText = function(text) {
                if (_instreamPlayer) {
                    _instreamPlayer.jwInstreamSetText(text);
                }
            };

            _this.jwIsBeforePlay = function() {
                return _controller.checkBeforePlay();
            };

            _this.jwIsBeforeComplete = function() {
                return _model.getVideo().checkComplete();
            };

            /** Used by ads component to display upcoming cuepoints **/
            _this.jwSetCues = _view.addCues;

            /** Events **/
            _this.jwAddEventListener = _controller.addEventListener;
            _this.jwRemoveEventListener = _controller.removeEventListener;

            /** Dock **/
            _this.jwDockAddButton = _view.addButton;
            _this.jwDockRemoveButton = _view.removeButton;
        }

        /** Getters **/

        function _statevarFactory(statevar) {
            return function() {
                return _model[statevar];
            };
        }

        _init();
    };

})(window.jwplayer);
(function (jwplayer) {

    var WHITE = '#FFFFFF',
        CCC = '#CCCCCC',
        THREES = '#333333',
        NINES = '#999999',
        _defaults = {
            size: 180,
            //position: html5.view.positions.NONE,
            //thumbs: true,
            // Colors
            backgroundcolor: THREES,
            fontcolor: NINES,
            overcolor: CCC,
            activecolor: CCC,
            titlecolor: CCC,
            titleovercolor: WHITE,
            titleactivecolor: WHITE,

            fontweight: 'normal',
            titleweight: 'normal',
            fontsize: 11,
            titlesize: 13
        },

        html5 = jwplayer.html5,
        events = jwplayer.events,
        utils = jwplayer.utils,
        _css = utils.css,
        _isMobile = utils.isMobile(),

        PL_CLASS = '.jwplaylist';

    html5.playlistcomponent = function (api, config) {
        var _api = api,
            _skin = _api.skin,
            _settings = utils.extend({}, _defaults, _api.skin.getComponentSettings('playlist'), config),
            _wrapper,
            _container,
            _playlist,
            _ul,
            _lastCurrent = -1,
            _clickedIndex,
            _slider,
            _itemheight = 76,
            _elements = {
                'background': undefined,
                'divider': undefined,
                'item': undefined,
                'itemOver': undefined,
                'itemImage': undefined,
                'itemActive': undefined
            },
            _isBasic,
            _this = this;

        _this.element = function () {
            return _wrapper;
        };

        _this.redraw = function () {
            if (_slider) {
                _slider.redraw();
            }
        };

        _this.show = function () {
            utils.show(_wrapper);
        };

        _this.hide = function () {
            utils.hide(_wrapper);
        };


        function _setup() {
            _wrapper = _createElement('div', 'jwplaylist');
            _wrapper.id = _api.id + '_jwplayer_playlistcomponent';

            _isBasic = (_api._model.playlistlayout === 'basic');

            _container = _createElement('div', 'jwlistcontainer');
            _appendChild(_wrapper, _container);

            _populateSkinElements();
            if (_isBasic) {
                _itemheight = 32;
            }
            if (_elements.divider) {
                _itemheight += _elements.divider.height;
            }

            _setupStyles();

            _api.jwAddEventListener(events.JWPLAYER_PLAYLIST_LOADED, _rebuildPlaylist);
            _api.jwAddEventListener(events.JWPLAYER_PLAYLIST_ITEM, _itemHandler);
            _api.jwAddEventListener(events.JWPLAYER_RESIZE, _resizeHandler);
        }

        function _resizeHandler(/* evt */) {
            _this.redraw();
        }

        function _internalSelector(className) {
            return '#' + _wrapper.id + (className ? ' .' + className : '');
        }

        function _setupStyles() {
            var imgPos = 0,
                imgWidth = 0,
                imgHeight = 0;

            utils.clearCss(_internalSelector());

            _css(_internalSelector(), {
                'background-color': _settings.backgroundcolor
            });

            _css(_internalSelector('jwlist'), {
                'background-image': _elements.background ? ' url(' + _elements.background.src + ')' : ''
            });

            _css(_internalSelector('jwlist' + ' *'), {
                color: _settings.fontcolor,
                font: _settings.fontweight + ' ' + _settings.fontsize + 'px Arial, Helvetica, sans-serif'
            });


            if (_elements.itemImage) {
                imgPos = (_itemheight - _elements.itemImage.height) / 2 + 'px ';
                imgWidth = _elements.itemImage.width;
                imgHeight = _elements.itemImage.height;
            } else {
                imgWidth = _itemheight * 4 / 3;
                imgHeight = _itemheight;
            }

            if (_elements.divider) {
                _css(_internalSelector('jwplaylistdivider'), {
                    'background-image': 'url(' + _elements.divider.src + ')',
                    'background-size': '100%' + ' ' + _elements.divider.height + 'px',
                    width: '100%',
                    height: _elements.divider.height
                });
            }

            _css(_internalSelector('jwplaylistimg'), {
                height: imgHeight,
                width: imgWidth,
                margin: imgPos ? (imgPos + '0 ' + imgPos + imgPos) : '0 5px 0 0'
            });

            _css(_internalSelector('jwlist li'), {
                'background-image': _elements.item ? 'url(' + _elements.item.src + ')' : '',
                height: _itemheight,
                overflow: 'hidden',
                'background-size': '100%' + ' ' + _itemheight + 'px',
                cursor: 'pointer'
            });

            var activeStyle = {
                overflow: 'hidden'
            };
            if (_settings.activecolor !== '') {
                activeStyle.color = _settings.activecolor;
            }
            if (_elements.itemActive) {
                activeStyle['background-image'] = 'url(' + _elements.itemActive.src + ')';
            }
            _css(_internalSelector('jwlist li.active'), activeStyle);
            _css(_internalSelector('jwlist li.active .jwtitle'), {
                color: _settings.titleactivecolor
            });
            _css(_internalSelector('jwlist li.active .jwdescription'), {
                color: _settings.activecolor
            });

            var overStyle = {
                overflow: 'hidden'
            };
            if (_settings.overcolor !== '') {
                overStyle.color = _settings.overcolor;
            }
            if (_elements.itemOver) {
                overStyle['background-image'] = 'url(' + _elements.itemOver.src + ')';
            }

            if (!_isMobile) {
                _css(_internalSelector('jwlist li:hover'), overStyle);
                _css(_internalSelector('jwlist li:hover .jwtitle'), {
                    color: _settings.titleovercolor
                });
                _css(_internalSelector('jwlist li:hover .jwdescription'), {
                    color: _settings.overcolor
                });
            }

            _css(_internalSelector('jwtextwrapper'), {
                height: _itemheight,
                position: 'relative'
            });

            _css(_internalSelector('jwtitle'), {
                overflow: 'hidden',
                display: 'inline-block',
                height: _isBasic ? _itemheight : 20,
                color: _settings.titlecolor,
                'font-size': _settings.titlesize,
                'font-weight': _settings.titleweight,
                'margin-top': _isBasic ? '0 10px' : 10,
                'margin-left': 10,
                'margin-right': 10,
                'line-height': _isBasic ? _itemheight : 20
            });

            _css(_internalSelector('jwdescription'), {
                display: 'block',
                'font-size': _settings.fontsize,
                'line-height': 18,
                'margin-left': 10,
                'margin-right': 10,
                overflow: 'hidden',
                height: 36,
                position: 'relative'
            });
        }

        function _createList() {
            var ul = _createElement('ul', 'jwlist');
            ul.id = _wrapper.id + '_ul' + Math.round(Math.random() * 10000000);
            return ul;
        }


        function _createItem(index) {
            var item = _playlist[index],
                li = _createElement('li', 'jwitem'),
                div;

            li.id = _ul.id + '_item_' + index;

            if (index > 0) {
                div = _createElement('div', 'jwplaylistdivider');
                _appendChild(li, div);
            } else {
                var divHeight = _elements.divider ? _elements.divider.height : 0;
                li.style.height = (_itemheight - divHeight) + 'px';
                li.style['background-size'] = '100% ' + (_itemheight - divHeight) + 'px';
            }

            var imageWrapper = _createElement('div', 'jwplaylistimg jwfill');

            var imageSrc;
            if (item['playlist.image'] && _elements.itemImage) {
                imageSrc = item['playlist.image'];
            } else if (item.image && _elements.itemImage) {
                imageSrc = item.image;
            } else if (_elements.itemImage) {
                imageSrc = _elements.itemImage.src;
            }
            if (imageSrc && !_isBasic) {
                _css('#' + li.id + ' .jwplaylistimg', {
                    'background-image': imageSrc
                });
                _appendChild(li, imageWrapper);
            }

            var textWrapper = _createElement('div', 'jwtextwrapper');
            var title = _createElement('span', 'jwtitle');
            title.innerHTML = (item && item.title) ? item.title : '';
            _appendChild(textWrapper, title);

            if (item.description && !_isBasic) {
                var desc = _createElement('span', 'jwdescription');
                desc.innerHTML = item.description;
                _appendChild(textWrapper, desc);
            }

            _appendChild(li, textWrapper);
            return li;
        }

        function _createElement(type, className) {
            var elem = document.createElement(type);
            if (className) {
                elem.className = className;
            }
            return elem;
        }

        function _appendChild(parent, child) {
            parent.appendChild(child);
        }

        function _rebuildPlaylist(/* evt */) {
            _container.innerHTML = '';

            _playlist = _getPlaylist();
            if (!_playlist) {
                return;
            }
            _ul = _createList();

            for (var i = 0; i < _playlist.length; i++) {
                var li = _createItem(i);
                if (_isMobile) {
                    var touch = new utils.touch(li);
                    touch.addEventListener(utils.touchEvents.TAP, _clickHandler(i));
                } else {
                    li.onclick = _clickHandler(i);
                }
                _appendChild(_ul, li);
            }

            _lastCurrent = _api.jwGetPlaylistIndex();

            _appendChild(_container, _ul);
            _slider = new html5.playlistslider(_wrapper.id + '_slider', _api.skin, _wrapper, _ul);

        }

        function _getPlaylist() {
            var list = _api.jwGetPlaylist();
            var strippedList = [];
            for (var i = 0; i < list.length; i++) {
                if (!list[i]['ova.hidden']) {
                    strippedList.push(list[i]);
                }
            }
            return strippedList;
        }

        function _clickHandler(index) {
            return function () {
                _clickedIndex = index;
                _api.jwPlaylistItem(index);
                _api.jwPlay(true);
            };
        }

        function _scrollToItem() {
            var idx = _api.jwGetPlaylistIndex();
            // No need to scroll if the user clicked the current item
            if (idx === _clickedIndex) {
                return;
            }
            _clickedIndex = -1;

            if (_slider && _slider.visible()) {
                _slider.thumbPosition(idx / (_api.jwGetPlaylist().length - 1));
            }
        }

        function _itemHandler(evt) {
            if (_lastCurrent >= 0) {
                document.getElementById(_ul.id + '_item_' + _lastCurrent).className = 'jwitem';
                _lastCurrent = evt.index;
            }
            document.getElementById(_ul.id + '_item_' + evt.index).className = 'jwitem active';
            _scrollToItem();
        }


        function _populateSkinElements() {
            utils.foreach(_elements, function (element) {
                _elements[element] = _skin.getSkinElement('playlist', element);
            });
        }

        _setup();
        return this;
    };

    /** Global playlist styles **/

    _css(PL_CLASS, {
        position: 'absolute',
        width: '100%',
        height: '100%'
    });

    utils.dragStyle(PL_CLASS, 'none');

    _css(PL_CLASS + ' .jwplaylistimg', {
        position: 'relative',
        width: '100%',
        'float': 'left',
        margin: '0 5px 0 0',
        background: '#000',
        overflow: 'hidden'
    });

    _css(PL_CLASS + ' .jwlist', {
        position: 'absolute',
        width: '100%',
        'list-style': 'none',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
    });

    _css(PL_CLASS + ' .jwlistcontainer', {
        position: 'absolute',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
    });

    _css(PL_CLASS + ' .jwlist li', {
        width: '100%'
    });

    _css(PL_CLASS + ' .jwtextwrapper', {
        overflow: 'hidden'
    });

    _css(PL_CLASS + ' .jwplaylistdivider', {
        position: 'absolute'
    });

    if (_isMobile) {
        utils.transitionStyle(PL_CLASS + ' .jwlist', 'top .35s');
    }

})(jwplayer);
(function(html5) {
    var utils = jwplayer.utils,
        touchevents = utils.touchEvents,
        _css = utils.css,

        SLIDER_CLASS = 'jwslider',
        SLIDER_TOPCAP_CLASS = 'jwslidertop',
        SLIDER_BOTTOMCAP_CLASS = 'jwsliderbottom',
        SLIDER_RAIL_CLASS = 'jwrail',
        SLIDER_RAILTOP_CLASS = 'jwrailtop',
        SLIDER_RAILBACK_CLASS = 'jwrailback',
        SLIDER_RAILBOTTOM_CLASS = 'jwrailbottom',
        SLIDER_THUMB_CLASS = 'jwthumb',
        SLIDER_THUMBTOP_CLASS = 'jwthumbtop',
        SLIDER_THUMBBACK_CLASS = 'jwthumbback',
        SLIDER_THUMBBOTTOM_CLASS = 'jwthumbbottom',

        DOCUMENT = document,
        WINDOW = window,
        UNDEFINED,

        /** Some CSS constants we should use for minimization **/
        JW_CSS_ABSOLUTE = 'absolute',
        JW_CSS_HIDDEN = 'hidden',
        JW_CSS_100PCT = '100%';

    html5.playlistslider = function(id, skin, parent, pane) {
        var _skin = skin,
            _pane = pane,
            _wrapper,
            _rail,
            _thumb,
            _dragging,
            _thumbPercent = 0,
            _dragTimeout,
            _dragInterval,
            _isMobile = utils.isMobile(),
            _touch,
            _visible = true,

            // Skin elements
            _sliderCapTop,
            _sliderCapBottom,
            _sliderRail,
            _sliderRailCapTop,
            _sliderRailCapBottom,
            _sliderThumb,
            _sliderThumbCapTop,
            _sliderThumbCapBottom,

            _topHeight,
            _bottomHeight,
            _redrawTimeout;


        this.element = function() {
            return _wrapper;
        };

        this.visible = function() {
            return _visible;
        };


        function _setup() {
            var capTop, capBottom;

            _wrapper = _createElement(SLIDER_CLASS, null, parent);
            _wrapper.id = id;

            _touch = new utils.touch(_pane);

            if (_isMobile) {
                _touch.addEventListener(touchevents.DRAG, _touchDrag);
            } else {
                _wrapper.addEventListener('mousedown', _startDrag, false);
                _wrapper.addEventListener('click', _moveThumb, false);
            }

            _populateSkinElements();

            _topHeight = _sliderCapTop.height;
            _bottomHeight = _sliderCapBottom.height;

            _css(_internalSelector(), {
                width: _sliderRail.width
            });
            _css(_internalSelector(SLIDER_RAIL_CLASS), {
                top: _topHeight,
                bottom: _bottomHeight
            });
            _css(_internalSelector(SLIDER_THUMB_CLASS), {
                top: _topHeight
            });

            capTop = _createElement(SLIDER_TOPCAP_CLASS, _sliderCapTop, _wrapper);
            capBottom = _createElement(SLIDER_BOTTOMCAP_CLASS, _sliderCapBottom, _wrapper);
            _rail = _createElement(SLIDER_RAIL_CLASS, null, _wrapper);
            _thumb = _createElement(SLIDER_THUMB_CLASS, null, _wrapper);

            if (!_isMobile) {
                capTop.addEventListener('mousedown', _scroll(-1), false);
                capBottom.addEventListener('mousedown', _scroll(1), false);
            }

            _createElement(SLIDER_RAILTOP_CLASS, _sliderRailCapTop, _rail);
            _createElement(SLIDER_RAILBACK_CLASS, _sliderRail, _rail, true);
            _createElement(SLIDER_RAILBOTTOM_CLASS, _sliderRailCapBottom, _rail);
            _css(_internalSelector(SLIDER_RAILBACK_CLASS), {
                top: _sliderRailCapTop.height,
                bottom: _sliderRailCapBottom.height
            });

            _createElement(SLIDER_THUMBTOP_CLASS, _sliderThumbCapTop, _thumb);
            _createElement(SLIDER_THUMBBACK_CLASS, _sliderThumb, _thumb, true);
            _createElement(SLIDER_THUMBBOTTOM_CLASS, _sliderThumbCapBottom, _thumb);

            _css(_internalSelector(SLIDER_THUMBBACK_CLASS), {
                top: _sliderThumbCapTop.height,
                bottom: _sliderThumbCapBottom.height
            });

            _redraw();

            if (_pane) {
                if (!_isMobile) {
                    _pane.addEventListener('mousewheel', _scrollHandler, false);
                    _pane.addEventListener('DOMMouseScroll', _scrollHandler, false);
                }
            }
        }

        function _internalSelector(className) {
            return '#' + _wrapper.id + (className ? ' .' + className : '');
        }

        function _createElement(className, skinElement, parent, stretch) {
            var elem = DOCUMENT.createElement('div');
            if (className) {
                elem.className = className;
                if (skinElement) {
                    _css(_internalSelector(className), {
                        'background-image': skinElement.src ? skinElement.src : UNDEFINED,
                        'background-repeat': stretch ? 'repeat-y' : 'no-repeat',
                        height: stretch ? UNDEFINED : skinElement.height
                    });
                }
            }
            if (parent) {
                parent.appendChild(elem);
            }
            return elem;
        }

        function _populateSkinElements() {
            _sliderCapTop = _getElement('sliderCapTop');
            _sliderCapBottom = _getElement('sliderCapBottom');
            _sliderRail = _getElement('sliderRail');
            _sliderRailCapTop = _getElement('sliderRailCapTop');
            _sliderRailCapBottom = _getElement('sliderRailCapBottom');
            _sliderThumb = _getElement('sliderThumb');
            _sliderThumbCapTop = _getElement('sliderThumbCapTop');
            _sliderThumbCapBottom = _getElement('sliderThumbCapBottom');
        }

        function _getElement(name) {
            var elem = _skin.getSkinElement('playlist', name);
            return elem ? elem : {
                width: 0,
                height: 0,
                src: UNDEFINED
            };
        }

        var _redraw = this.redraw = function() {
            clearTimeout(_redrawTimeout);
            _redrawTimeout = setTimeout(function() {
                if (_pane && _pane.clientHeight) {
                    _setThumbPercent(_pane.parentNode.clientHeight / _pane.clientHeight);
                } else {
                    _redrawTimeout = setTimeout(_redraw, 10);
                }
            }, 0);
        };


        function _scrollHandler(evt) {
            if (!_visible) {
                return;
            }
            evt = evt ? evt : WINDOW.event;
            var wheelData = evt.detail ? evt.detail * -1 : evt.wheelDelta / 40;
            _setThumbPosition(_thumbPercent - wheelData / 10);

            // Cancel event so the page doesn't scroll
            if (evt.stopPropagation) {
                evt.stopPropagation();
            }
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
            evt.cancelBubble = true;
            evt.cancel = true;

            return false;
        }

        function _setThumbPercent(pct) {
            if (pct < 0) {
                pct = 0;
            }
            if (pct > 1) {
                _visible = false;
            } else {
                _visible = true;
                _css(_internalSelector(SLIDER_THUMB_CLASS), {
                    height: Math.max(_rail.clientHeight * pct, _sliderThumbCapTop.height + _sliderThumbCapBottom.height)
                });
            }
            _css(_internalSelector(), {
                visibility: _visible ? 'visible' : JW_CSS_HIDDEN
            });
            if (_pane) {
                _pane.style.width = _visible ? _pane.parentElement.clientWidth - _sliderRail.width + 'px' : '';
            }
        }

        var _setThumbPosition = this.thumbPosition = function(pct) {
            if (isNaN(pct)) {
                pct = 0;
            }
            _thumbPercent = Math.max(0, Math.min(1, pct));
            _css(_internalSelector(SLIDER_THUMB_CLASS), {
                top: _topHeight + (_rail.clientHeight - _thumb.clientHeight) * _thumbPercent
            });
            if (pane) {
                pane.style.top = Math.min(0, _wrapper.clientHeight - pane.scrollHeight) * _thumbPercent + 'px';
            }
        };


        function _startDrag(evt) {
            if (evt.button === 0) {
                _dragging = true;
            }
            DOCUMENT.onselectstart = function() {
                return false;
            };
            WINDOW.addEventListener('mousemove', _moveThumb, false);
            WINDOW.addEventListener('mouseup', _endDrag, false);
        }

        function _touchDrag(evt) {
            _setThumbPosition(_thumbPercent - (evt.deltaY * 2 / _pane.clientHeight));
        }

        function _moveThumb(evt) {
            if (_dragging || evt.type === 'click') {
                var railRect = utils.bounds(_rail),
                    rangeTop = _thumb.clientHeight / 2,
                    rangeBottom = railRect.height - rangeTop,
                    y = evt.pageY - railRect.top,
                    pct = (y - rangeTop) / (rangeBottom - rangeTop);
                _setThumbPosition(pct);
            }
        }

        function _scroll(dir) {
            return function(evt) {
                if (evt.button > 0) {
                    return;
                }
                _setThumbPosition(_thumbPercent + (dir * 0.05));
                _dragTimeout = setTimeout(function() {
                    _dragInterval = setInterval(function() {
                        _setThumbPosition(_thumbPercent + (dir * 0.05));
                    }, 50);
                }, 500);
            };
        }

        function _endDrag() {
            _dragging = false;
            WINDOW.removeEventListener('mousemove', _moveThumb);
            WINDOW.removeEventListener('mouseup', _endDrag);
            DOCUMENT.onselectstart = UNDEFINED;
            clearTimeout(_dragTimeout);
            clearInterval(_dragInterval);
        }

        _setup();
        return this;
    };

    function _globalSelector() {
        var selector = [],
            i;
        for (i = 0; i < arguments.length; i++) {
            selector.push('.jwplaylist .' + arguments[i]);
        }
        return selector.join(',');
    }

    /** Global slider styles **/

    _css(_globalSelector(SLIDER_CLASS), {
        position: JW_CSS_ABSOLUTE,
        height: JW_CSS_100PCT,
        visibility: JW_CSS_HIDDEN,
        right: 0,
        top: 0,
        cursor: 'pointer',
        'z-index': 1,
        overflow: JW_CSS_HIDDEN
    });

    _css(_globalSelector(SLIDER_CLASS) + ' *', {
        position: JW_CSS_ABSOLUTE,
        width: JW_CSS_100PCT,
        'background-position': 'center',
        'background-size': JW_CSS_100PCT + ' ' + JW_CSS_100PCT,
        overflow: JW_CSS_HIDDEN
    });

    _css(_globalSelector(SLIDER_TOPCAP_CLASS, SLIDER_RAILTOP_CLASS, SLIDER_THUMBTOP_CLASS), {
        top: 0
    });
    _css(_globalSelector(SLIDER_BOTTOMCAP_CLASS, SLIDER_RAILBOTTOM_CLASS, SLIDER_THUMBBOTTOM_CLASS), {
        bottom: 0
    });

})(jwplayer.html5);
/**
 * JW Player html5 right-click
 *
 * @author pablo
 * @version 6.0
 */
(function(html5) {
    var utils = jwplayer.utils,
        _css = utils.css,

        ABOUT_DEFAULT = 'About JW Player ',
        LINK_DEFAULT = 'http://www.longtailvideo.com/jwpabout/?a=r&v=',

        DOCUMENT = document,
        RC_CLASS = '.jwclick',
        RC_ITEM_CLASS = RC_CLASS + '_item',

        /** Some CSS constants we should use for minimization **/
        JW_CSS_100PCT = '100%',
        JW_CSS_BOX_SHADOW = '5px 5px 7px rgba(0,0,0,.10), 0px 1px 0px rgba(255,255,255,.3) inset',
        JW_CSS_NONE = 'none',
        JW_CSS_WHITE = '#FFF';

    html5.rightclick = function(api, config) {
        var _api = api,
            _container, // = DOCUMENT.getElementById(_api.id),
            _config = utils.extend({
                aboutlink: LINK_DEFAULT + html5.version + '&m=h&e=o',
                abouttext: ABOUT_DEFAULT + html5.version + '...'
            }, config),
            _mouseOverContext = false,
            _menu,
            _about;

        function _init() {
            _container = DOCUMENT.getElementById(_api.id);
            _menu = _createElement(RC_CLASS);
            _menu.id = _api.id + '_menu';
            _menu.style.display = JW_CSS_NONE;
            _container.oncontextmenu = _showContext;
            _menu.onmouseover = function() {
                _mouseOverContext = true;
            };
            _menu.onmouseout = function() {
                _mouseOverContext = false;
            };
            DOCUMENT.addEventListener('mousedown', _hideContext, false);
            _about = _createElement(RC_ITEM_CLASS);
            _about.innerHTML = _config.abouttext;
            _about.onclick = _clickHandler;
            _menu.appendChild(_about);
            _container.appendChild(_menu);
        }

        function _createElement(className) {
            var elem = DOCUMENT.createElement('div');
            elem.className = className.replace('.', '');
            return elem;
        }

        function _clickHandler() {
            window.top.location = _config.aboutlink;
        }

        function _showContext(evt) {
        	
        	//去除JS右键
        	return;
        
            var target, containerBounds, bounds;

            if (_mouseOverContext) {
                // returning because _mouseOverContext is true, indicating the mouse is over the menu
                return;
            }

            // IE6-9 do not pass an event parameter and get the target from window.srcElement
            // https://developer.mozilla.org/en-US/docs/Web/API/event.target
            evt = evt || window.event;
            target = evt.target || evt.srcElement;


            containerBounds = utils.bounds(_container);
            bounds = utils.bounds(target);

            // hide the menu first to avoid an 'up-then-over' visual effect
            _menu.style.display = JW_CSS_NONE;
            _menu.style.left = (evt.offsetX ? evt.offsetX : evt.layerX) + bounds.left - containerBounds.left + 'px';
            _menu.style.top = (evt.offsetY ? evt.offsetY : evt.layerY) + bounds.top - containerBounds.top + 'px';
            _menu.style.display = 'block';
            evt.preventDefault();
        }

        function _hideContext() {
            if (_mouseOverContext) {
                // returning because _mouseOverContext is true, indicating the mouse is over the menu
                return;
            } else {
                _menu.style.display = JW_CSS_NONE;
            }
        }

        this.element = function() {
            return _menu;
        };

        this.destroy = function() {
            DOCUMENT.removeEventListener('mousedown', _hideContext, false);
        };

        _init();
    };

    _css(RC_CLASS, {
        'background-color': JW_CSS_WHITE,
        '-webkit-border-radius': 5,
        '-moz-border-radius': 5,
        'border-radius': 5,
        height: 'auto',
        border: '1px solid #bcbcbc',
        'font-family': '\'MS Sans Serif\', \'Geneva\', sans-serif',
        'font-size': 10,
        width: 320,
        '-webkit-box-shadow': JW_CSS_BOX_SHADOW,
        '-moz-box-shadow': JW_CSS_BOX_SHADOW,
        'box-shadow': JW_CSS_BOX_SHADOW,
        position: 'absolute',
        'z-index': 999
    }, true);

    _css(RC_CLASS + ' div', {
        padding: '8px 21px',
        margin: '0px',
        'background-color': JW_CSS_WHITE,
        border: 'none',
        'font-family': '\'MS Sans Serif\', \'Geneva\', sans-serif',
        'font-size': 10,
        color: 'inherit'
    }, true);

    _css(RC_ITEM_CLASS, {
        padding: '8px 21px',
        'text-align': 'left',
        cursor: 'pointer'
    }, true);

    _css(RC_ITEM_CLASS + ':hover', {
        'background-color': '#595959',
        color: JW_CSS_WHITE
    }, true);

    _css(RC_ITEM_CLASS + ' a', {
        'text-decoration': JW_CSS_NONE,
        color: '#000'
    }, true);

    _css(RC_CLASS + ' hr', {
        width: JW_CSS_100PCT,
        padding: 0,
        margin: 0,
        border: '1px #e9e9e9 solid'
    }, true);

})(jwplayer.html5);
/**
 * This class is responsible for setting up the player and triggering the PLAYER_READY event, or an JWPLAYER_ERROR event
 *
 * The order of the player setup is as follows:
 *
 * 1. parse config
 * 2. load skin (async)
 * 3. load external playlist (async)
 * 4. load preview image (requires 3)
 * 5. initialize components (requires 2)
 * 6. initialize plugins (requires 5)
 * 7. ready
 *
 * @author pablo
 * @version 6.0
 */
(function(jwplayer) {
    var html5 = jwplayer.html5,
        utils = jwplayer.utils,
        _ = jwplayer._,
        events = jwplayer.events;


    html5.setup = function(model, view) {
        var _model = model,
            _view = view,
            _skin,
            _eventDispatcher = new events.eventdispatcher(),
            _errorState = false;

        var PARSE_CONFIG = {
                method: _parseConfig,
                depends: []
            },
            LOAD_SKIN = {
                method: _loadSkin,
                depends: [PARSE_CONFIG]
            },
            LOAD_PLAYLIST = {
                method: _loadPlaylist,
                depends: [PARSE_CONFIG]
            },
            SETUP_COMPONENTS = {
                method: _setupComponents,
                depends: [
                    LOAD_PLAYLIST,
                    LOAD_SKIN
                ]
            },
            INIT_PLUGINS = {
                method: _initPlugins,
                depends: [
                    SETUP_COMPONENTS,
                    LOAD_PLAYLIST
                ]
            },
            SEND_READY = {
                method: _sendReady,
                depends: [INIT_PLUGINS]
            };

        var _queue = [
            PARSE_CONFIG,
            LOAD_SKIN,
            LOAD_PLAYLIST,
            SETUP_COMPONENTS,
            INIT_PLUGINS,
            SEND_READY
        ];

        this.start = function () {
            _.defer(_nextTask);
        };

        function _nextTask() {
            if (this.cancelled) {
                return;
            }

            for (var i = 0; i < _queue.length; i++) {
                var task = _queue[i];
                if (_allComplete(task.depends)) {
                    _queue.splice(i, 1);
                    task.method();
                    _.defer(_nextTask);
                }
            }
        }

        function _allComplete(dependencies) {
            // return true if empty array,
            //  or if each object has an attribute 'complete' which is true
            return _.all(_.map(dependencies, _.property('complete')));
        }

        function _taskComplete(task) {
            task.complete = true;
            if (_queue.length > 0 && !_errorState) {
                _.defer(_nextTask);
            }
        }

        function _parseConfig() {
            if (model.edition && model.edition() === 'invalid') {
                _error('Error setting up player: Invalid license key');
            } else {
                _taskComplete(PARSE_CONFIG);
            }
        }

        function _loadSkin() {
            _skin = new html5.skin();
            _skin.load(_model.config.skin, _skinLoaded, _skinError);
        }

        function _skinLoaded() {
            _taskComplete(LOAD_SKIN);
        }

        function _skinError(message) {
            _error('Error loading skin: ' + message);
        }

        function _loadPlaylist() {
            var type = utils.typeOf(_model.config.playlist);
            if (type === 'array') {
                _completePlaylist(new jwplayer.playlist(_model.config.playlist));
            } else {
                _error('Playlist type not supported: ' + type);
            }
        }

        function _completePlaylist(playlist) {
            _model.setPlaylist(playlist);
            if (_model.playlist.length === 0 || _model.playlist[0].sources.length === 0) {
                _error('Error loading playlist: No playable sources found');
            } else {
                _taskComplete(LOAD_PLAYLIST);
            }
        }

        function _setupComponents() {
            _view.setup(_skin);
            _taskComplete(SETUP_COMPONENTS);
        }

        function _initPlugins() {
            _taskComplete(INIT_PLUGINS);
        }

        function _sendReady() {
            if (this.cancelled) {
                return;
            }
            _eventDispatcher.sendEvent(events.JWPLAYER_READY);
            _taskComplete(SEND_READY);
        }

        function _error(message) {
            _errorState = true;
            _eventDispatcher.sendEvent(events.JWPLAYER_ERROR, {
                message: message
            });
            _view.setupError(message);
        }

        this.destroy = function() {
            this.cancelled = true;
        };

        utils.extend(this, _eventDispatcher);

    };

})(jwplayer);
/**
 * JW Player component that loads PNG skins.
 *
 * @author zach
 * @version 5.4
 */
(function(html5) {
    html5.skin = function() {
        var _components = {};
        var _loaded = false;

        this.load = function(path, completeCallback, errorCallback) {
            new html5.skinloader(path, function(skin) {
                _loaded = true;
                _components = skin;
                if (typeof completeCallback === 'function') {
                    completeCallback();
                }
            }, function(message) {
                if (typeof errorCallback === 'function') {
                    errorCallback(message);
                }
            });

        };

        this.getSkinElement = function(component, element) {
            component = _lowerCase(component);
            element = _lowerCase(element);
            if (_loaded) {
                try {
                    return _components[component].elements[element];
                } catch (err) {
                    jwplayer.utils.log('No such skin component / element: ', [component, element]);
                }
            }
            return null;
        };

        this.getComponentSettings = function(component) {
            component = _lowerCase(component);
            if (_loaded && _components && _components[component]) {
                return _components[component].settings;
            }
            return null;
        };

        this.getComponentLayout = function(component) {
            component = _lowerCase(component);
            if (_loaded) {
                var lo = _components[component].layout;
                if (lo && (lo.left || lo.right || lo.center)) {
                    return _components[component].layout;
                }
            }
            return null;
        };

        function _lowerCase(string) {
            return string.toLowerCase();
        }

    };
})(jwplayer.html5);

(function(html5) {
    var utils = jwplayer.utils,
        FORMAT_ERROR = 'Skin formatting error';

    /** Constructor **/
    html5.skinloader = function(skinPath, completeHandler, errorHandler) {
        var _skin = {},
            _completeHandler = completeHandler,
            _errorHandler = errorHandler,
            _loading = true,
            _skinPath = skinPath,
            _error = false,
            // Keeping this as 1 for now. Will change if necessary for mobile
            _mobileMultiplier = jwplayer.utils.isMobile() ? 1 : 1,
            _ratio = 1;

        /** Load the skin **/
        function _load() {
            if (typeof _skinPath !== 'string' || _skinPath === '') {
                _loadSkin(html5.defaultskin());
            } else {
                if (utils.extension(_skinPath) !== 'xml') {
                    _errorHandler('Skin not a valid file type');
                    return;
                }
                // Load the default skin first; if any components are defined in the loaded skin,
                // they will overwrite the default
                new html5.skinloader('', _defaultLoaded, _errorHandler);
            }

        }

        function _defaultLoaded(defaultSkin) {
            _skin = defaultSkin;
            utils.ajax(utils.getAbsolutePath(_skinPath), function(xmlrequest) {
                try {
                    if (utils.exists(xmlrequest.responseXML)) {
                        _loadSkin(xmlrequest.responseXML);
                    }
                } catch (err) {
                    _errorHandler(FORMAT_ERROR);
                }
            }, function(message) {
                _errorHandler(message);
            });
        }

        function _getElementsByTagName(xml, tagName) {
            return xml ? xml.getElementsByTagName(tagName) : null;
        }

        function _loadSkin(xml) {
            var skinNode = _getElementsByTagName(xml, 'skin')[0],
                components = _getElementsByTagName(skinNode, 'component'),
                target = skinNode.getAttribute('target'),
                ratio = parseFloat(skinNode.getAttribute('pixelratio'));

            // Make sure ratio is set; don't want any divides by zero
            if (ratio > 0) {
                _ratio = ratio;
            }

            if (!utils.versionCheck(target)) {
                _errorHandler('Incompatible player version');
            }

            if (components.length === 0) {
                // This is legal according to the skin doc - don't produce an error.
                // _errorHandler(FORMAT_ERROR);
                _completeHandler(_skin);
                return;
            }
            for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
                var componentName = _lowerCase(components[componentIndex].getAttribute('name')),
                    component = {
                        settings: {},
                        elements: {},
                        layout: {}
                    },
                    elements = _getElementsByTagName(_getElementsByTagName(components[componentIndex], 'elements')[0],
                        'element');

                _skin[componentName] = component;

                for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
                    _loadImage(elements[elementIndex], componentName);
                }
                var settingsElement = _getElementsByTagName(components[componentIndex], 'settings')[0];
                if (settingsElement && settingsElement.childNodes.length > 0) {
                    var settings = _getElementsByTagName(settingsElement, 'setting');
                    for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
                        var name = settings[settingIndex].getAttribute('name');
                        var value = settings[settingIndex].getAttribute('value');
                        if (/color$/.test(name)) {
                            value = utils.stringToColor(value);
                        }
                        component.settings[_lowerCase(name)] = value;
                    }
                }
                var layout = _getElementsByTagName(components[componentIndex], 'layout')[0];
                if (layout && layout.childNodes.length > 0) {
                    var groups = _getElementsByTagName(layout, 'group');
                    for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
                        var group = groups[groupIndex],
                            _layout = {
                                elements: []
                            };
                        component.layout[_lowerCase(group.getAttribute('position'))] = _layout;
                        for (var attributeIndex = 0; attributeIndex < group.attributes.length; attributeIndex++) {
                            var attribute = group.attributes[attributeIndex];
                            _layout[attribute.name] = attribute.value;
                        }
                        var groupElements = _getElementsByTagName(group, '*');
                        for (var groupElementIndex = 0; groupElementIndex < groupElements.length; groupElementIndex++) {
                            var element = groupElements[groupElementIndex];
                            _layout.elements.push({
                                type: element.tagName
                            });
                            for (var attrIndex = 0; attrIndex < element.attributes.length; attrIndex++) {
                                var elementAttr = element.attributes[attrIndex];
                                _layout.elements[groupElementIndex][_lowerCase(elementAttr.name)] = elementAttr.value;
                            }
                            if (!utils.exists(_layout.elements[groupElementIndex].name)) {
                                _layout.elements[groupElementIndex].name = element.tagName;
                            }
                        }
                    }
                }

                _loading = false;

                _checkComplete();
            }
        }

        /** Load the data for a single element. **/
        function _loadImage(element, component) {
            component = _lowerCase(component);
            var img = new Image(),
                elementName = _lowerCase(element.getAttribute('name')),
                elementSource = element.getAttribute('src'),
                imgUrl;

            if (elementSource.indexOf('data:image/png;base64,') === 0) {
                imgUrl = elementSource;
            } else {
                var skinUrl = utils.getAbsolutePath(_skinPath);
                var skinRoot = skinUrl.substr(0, skinUrl.lastIndexOf('/'));
                imgUrl = [skinRoot, component, elementSource].join('/');
            }

            _skin[component].elements[elementName] = {
                height: 0,
                width: 0,
                src: '',
                ready: false,
                image: img
            };

            img.onload = function() {
                _completeImageLoad(img, elementName, component);
            };
            img.onerror = function() {
                _error = true;
                _errorHandler('Skin image not found: ' + this.src);
            };

            img.src = imgUrl;
        }

        function _checkComplete() {
            var ready = true;
            for (var componentName in _skin) {
                if (componentName !== 'properties' && _skin.hasOwnProperty(componentName)) {
                    var elements = _skin[componentName].elements;
                    for (var element in elements) {
                        if (elements.hasOwnProperty(element)) {
                            ready &= _getElement(componentName, element).ready;
                        }
                    }
                }
            }
            if (!ready) {
                return;
            }
            if (!_loading) {
                _completeHandler(_skin);
            }
        }

        function _completeImageLoad(img, element, component) {
            var elementObj = _getElement(component, element);
            if (elementObj) {
                elementObj.height = Math.round((img.height / _ratio) * _mobileMultiplier);
                elementObj.width  = Math.round((img.width  / _ratio) * _mobileMultiplier);
                elementObj.src = img.src;
                elementObj.ready = true;
                _checkComplete();
            } else {
                utils.log('Loaded an image for a missing element: ' + component + '.' + element);
            }
        }


        function _getElement(component, element) {
            return _skin[_lowerCase(component)] ? _skin[_lowerCase(component)].elements[_lowerCase(element)] : null;
        }

        function _lowerCase(string) {
            return string ? string.toLowerCase() : '';
        }
        _load();
    };
})(jwplayer.html5);
(function(jwplayer) {

    var html5 = jwplayer.html5,
        utils = jwplayer.utils,
        events = jwplayer.events,
        _css = utils.css;


    /** Displays thumbnails over the controlbar **/
    html5.thumbs = function(id) {
        var _display,
            _cues,
            _vttPath,
            _vttRequest,
            _id = id,
            _url,
            _images = {},
            _image,
            _eventDispatcher = new events.eventdispatcher();

        utils.extend(this, _eventDispatcher);

        _display = document.createElement('div');
        _display.id = _id;

        function _loadVTT(vtt) {
            _css.style(_display, {
                display: 'none'
            });

            if (_vttRequest) {
                _vttRequest.onload = null;
                _vttRequest.onreadystatechange = null;
                _vttRequest.onerror = null;
                if (_vttRequest.abort) {
                    _vttRequest.abort();
                }
                _vttRequest = null;
            }
            if (_image) {
                _image.onload = null;
            }

            if (vtt) {
                _vttPath = vtt.split('?')[0].split('/').slice(0, -1).join('/');
                _vttRequest = utils.ajax(vtt, _vttLoaded, _vttFailed, true);
            } else {
                _cues =
                    _url =
                    _image = null;
                _images = {};
            }
        }

        function _vttLoaded(data) {
            _vttRequest = null;
            try {
                data = new jwplayer.parsers.srt().parse(data.responseText, true);
            } catch (e) {
                _vttFailed(e.message);
                return;
            }
            if (utils.typeOf(data) !== 'array') {
                return _vttFailed('Invalid data');
            }
            _cues = data;
        }

        function _vttFailed(error) {
            _vttRequest = null;
            utils.log('Thumbnails could not be loaded: ' + error);
        }

        function _loadImage(url, callback) {
            // only load image if it's different from the last one
            if (url && url !== _url) {
                _url = url;
                if (url.indexOf('://') < 0) {
                    url = _vttPath ? _vttPath + '/' + url : url;
                }
                var style = {
                    display: 'block',
                    margin: '0 auto',
                    'background-position': '0 0',
                    width: 0,
                    height: 0
                };
                var hashIndex = url.indexOf('#xywh');
                if (hashIndex > 0) {
                    try {
                        var matched = (/(.+)\#xywh=(\d+),(\d+),(\d+),(\d+)/).exec(url);
                        url = matched[1];
                        style['background-position'] = (matched[2] * -1) + 'px ' + (matched[3] * -1) + 'px';
                        style.width = matched[4];
                        style.height = matched[5];
                    } catch (e) {
                        _vttFailed('Could not parse thumbnail');
                        return;
                    }
                }

                var image = _images[url];
                if (!image) {
                    image = new Image();
                    image.onload = function() {
                        _updateSprite(image, style, callback);
                    };
                    _images[url] = image;
                    image.src = url;
                } else {
                    _updateSprite(image, style, callback);
                }
                if (_image) {
                    // ignore previous image
                    _image.onload = null;
                }
                _image = image;
            }
        }

        function _updateSprite(image, style, callback) {
            image.onload = null;
            if (!style.width) {
                style.width = image.width;
                style.height = image.height;
            }
            style['background-image'] = image.src;
            _css.style(_display, style);
            if (callback) {
                callback(style.width);
            }
        }

        this.load = function(thumbsVTT) {
            _loadVTT(thumbsVTT);
        };

        this.element = function() {
            return _display;
        };

        // Update display
        this.updateTimeline = function(seconds, callback) {
            if (!_cues) {
                return;
            }
            var i = 0;
            while (i < _cues.length && seconds > _cues[i].end) {
                i++;
            }
            if (i === _cues.length) {
                i--;
            }
            var url = _cues[i].text;
            _loadImage(url, callback);
            return url;
        };
    };


})(jwplayer);
(function(window) {
    var jwplayer = window.jwplayer,
        html5 = jwplayer.html5,
        utils = jwplayer.utils,
        events = jwplayer.events,
        states = events.state,
        _css = utils.css,
        _bounds = utils.bounds,
        _isMobile = utils.isMobile(),
        _isIPad = utils.isIPad(),
        _isIPod = utils.isIPod(),
        PLAYER_CLASS = 'jwplayer',
        ASPECT_MODE = 'aspectMode',
        FULLSCREEN_SELECTOR = '.' + PLAYER_CLASS + '.jwfullscreen',
        VIEW_MAIN_CONTAINER_CLASS = 'jwmain',
        VIEW_INSTREAM_CONTAINER_CLASS = 'jwinstream',
        VIEW_VIDEO_CONTAINER_CLASS = 'jwvideo',
        VIEW_CONTROLS_CONTAINER_CLASS = 'jwcontrols',
        VIEW_ASPECT_CONTAINER_CLASS = 'jwaspect',
        VIEW_PLAYLIST_CONTAINER_CLASS = 'jwplaylistcontainer',
        DOCUMENT_FULLSCREEN_EVENTS = [
            'fullscreenchange',
            'webkitfullscreenchange',
            'mozfullscreenchange',
            'MSFullscreenChange'
        ],

        /*************************************************************
         * Player stylesheets - done once on script initialization;  *
         * These CSS rules are used for all JW Player instances      *
         *************************************************************/
        JW_CSS_SMOOTH_EASE = 'opacity .25s ease',
        JW_CSS_100PCT = '100%',
        JW_CSS_ABSOLUTE = 'absolute',
        JW_CSS_IMPORTANT = ' !important',
        JW_CSS_HIDDEN = 'hidden',
        JW_CSS_NONE = 'none',
        JW_CSS_BLOCK = 'block';

    html5.view = function(_api, _model) {
        var _playerElement,
            _container,
            _controlsLayer,
            _aspectLayer,
            _playlistLayer,
            _controlsTimeout = -1,
            _timeoutDuration = _isMobile ? 4000 : 2000,
            _videoLayer,
            _lastWidth,
            _lastHeight,
            _instreamLayer,
            _instreamControlbar,
            _instreamDisplay,
            _instreamModel,
            _instreamMode = false,
            _controlbar,
            _display,
            _castDisplay,
            _dock,
            _logo,
            _logoConfig = utils.extend({}, _model.componentConfig('logo')),
            _captions,
            _playlist,
            _audioMode,
            _errorState = false,
            _showing = false,
            _forcedControlsState = null,
            _replayState,
            _rightClickMenu,
            _resizeMediaTimeout = -1,
            _inCB = false, // in control bar
            _currentState,

            // view fullscreen methods and ability
            _requestFullscreen,
            _exitFullscreen,
            _elementSupportsFullscreen = false,

            // Used to differentiate tab focus events from click events, because when
            //  it is a click, the mouseDown event will occur immediately prior
            _focusFromClick = false,

            _this = utils.extend(this, new events.eventdispatcher());

        function _init() {

            _playerElement = _createElement('div', PLAYER_CLASS + ' playlist-' + _model.playlistposition);
            _playerElement.id = _api.id;
            _playerElement.tabIndex = 0;

            _requestFullscreen =
                _playerElement.requestFullscreen ||
                _playerElement.webkitRequestFullscreen ||
                _playerElement.webkitRequestFullScreen ||
                _playerElement.mozRequestFullScreen ||
                _playerElement.msRequestFullscreen;
            _exitFullscreen =
                document.exitFullscreen ||
                document.webkitExitFullscreen ||
                document.webkitCancelFullScreen ||
                document.mozCancelFullScreen ||
                document.msExitFullscreen;
            _elementSupportsFullscreen = _requestFullscreen && _exitFullscreen;

            if (_model.aspectratio) {
                _css.style(_playerElement, {
                    display: 'inline-block'
                });
                _playerElement.className = _playerElement.className.replace(PLAYER_CLASS,
                    PLAYER_CLASS + ' ' + ASPECT_MODE);
            }

            var replace = document.getElementById(_api.id);
            replace.parentNode.replaceChild(_playerElement, replace);
        }

        function adjustSeek(amount) {
            var newSeek = utils.between(_model.position + amount, 0, this.getDuration());
            this.seek(newSeek);
        }

        function adjustVolume(amount) {
            var newVol = utils.between(this.getVolume() + amount, 0, 100);
            this.setVolume(newVol);
        }

        function allowKeyHandling(evt) {
            // If Meta keys return
            if (evt.ctrlKey || evt.metaKey) {
                return false;
            }

            // Controls may be disabled during share screens, or via API
            if (!_model.controls) {
                return false;
            }
            return true;
        }

        function handleKeydown(evt) {
            if (!allowKeyHandling(evt)) {
                // Let event bubble upwards
                return true;
            }

            // On keypress show the controlbar for a few seconds
            if (!_controlbar.adMode()) {
                _showControlbar();
                _resetTapTimer();
            }

            var jw = jwplayer(_api.id);
            switch (evt.keyCode) {
                case 27: // Esc
                    jw.setFullscreen(false);
                    break;
                case 13: // enter
                case 32: // space
                    jw.play();
                    break;
                case 37: // left-arrow, if not adMode
                    if (!_controlbar.adMode()) {
                        adjustSeek.call(jw, -5);
                    }
                    break;
                case 39: // right-arrow, if not adMode
                    if (!_controlbar.adMode()) {
                        adjustSeek.call(jw, 5);
                    }
                    break;
                case 38: // up-arrow
                    adjustVolume.call(jw, 10);
                    break;
                case 40: // down-arrow
                    adjustVolume.call(jw, -10);
                    break;
                case 77: // m-key
                    jw.setMute();
                    break;
                case 70: // f-key
                    jw.setFullscreen();
                    break;
                default:
                    if (evt.keyCode >= 48 && evt.keyCode <= 59) {
                        // if 0-9 number key, move to n/10 of the percentage of the video
                        var number = evt.keyCode - 48;
                        var newSeek = (number / 10) * jw.getDuration();
                        jw.seek(newSeek);
                    }
                    break;
            }

            if (/13|32|37|38|39|40/.test(evt.keyCode)) {
                // Prevent keypresses from scrolling the screen
                evt.preventDefault();
                return false;
            }
        }

        function handleMouseDown() {
            _focusFromClick = true;

            // After a click it no longer has 'tab-focus'
            _this.sendEvent(events.JWPLAYER_VIEW_TAB_FOCUS, {
                hasFocus: false
            });
        }

        function handleFocus() {
            var wasTabEvent = !_focusFromClick;
            _focusFromClick = false;

            if (wasTabEvent) {
                _this.sendEvent(events.JWPLAYER_VIEW_TAB_FOCUS, {
                    hasFocus: true
                });
            }

            // On tab-focus, show the control bar for a few seconds
            if (!_controlbar.adMode()) {
                _showControlbar();
                _resetTapTimer();
            }
        }

        function handleBlur() {
            _focusFromClick = false;
            _this.sendEvent(events.JWPLAYER_VIEW_TAB_FOCUS, {
                hasFocus: false
            });
        }

        this.getCurrentCaptions = function() {
            return _captions.getCurrentCaptions();
        };

        this.setCurrentCaptions = function(caption) {
            _captions.setCurrentCaptions(caption);
        };

        this.getCaptionsList = function() {
            return _captions.getCaptionsList();
        };

        function _responsiveListener() {
            var bounds = _bounds(_playerElement),
                containerWidth = Math.round(bounds.width),
                containerHeight = Math.round(bounds.height);
            if (!document.body.contains(_playerElement)) {
                window.removeEventListener('resize', _responsiveListener);
                if (_isMobile) {
                    window.removeEventListener('orientationchange', _responsiveListener);
                }
            } else if (containerWidth && containerHeight) {
                if (containerWidth !== _lastWidth || containerHeight !== _lastHeight) {
                    _lastWidth = containerWidth;
                    _lastHeight = containerHeight;
                    if (_display) {
                        _display.redraw();
                    }
                    clearTimeout(_resizeMediaTimeout);
                    _resizeMediaTimeout = setTimeout(_resizeMedia, 50);
                    _this.sendEvent(events.JWPLAYER_RESIZE, {
                        width: containerWidth,
                        height: containerHeight
                    });
                }
            }
            return bounds;
        }


        this.setup = function(skin) {
            if (_errorState) {
                return;
            }
            _api.skin = skin;

            _container = _createElement('span', VIEW_MAIN_CONTAINER_CLASS);
            _container.id = _api.id + '_view';
            _videoLayer = _createElement('span', VIEW_VIDEO_CONTAINER_CLASS);
            _videoLayer.id = _api.id + '_media';

            _controlsLayer = _createElement('span', VIEW_CONTROLS_CONTAINER_CLASS);
            _instreamLayer = _createElement('span', VIEW_INSTREAM_CONTAINER_CLASS);
            _playlistLayer = _createElement('span', VIEW_PLAYLIST_CONTAINER_CLASS);
            _aspectLayer = _createElement('span', VIEW_ASPECT_CONTAINER_CLASS);

            _setupControls();

            _container.appendChild(_videoLayer);
            _container.appendChild(_controlsLayer);
            _container.appendChild(_instreamLayer);

            _playerElement.appendChild(_container);
            _playerElement.appendChild(_aspectLayer);
            _playerElement.appendChild(_playlistLayer);

            // adds video tag to video layer
            _model.getVideo().setContainer(_videoLayer);

            // Native fullscreen
            _model.addEventListener('fullscreenchange', _fullscreenChangeHandler);
            // DOM fullscreen
            for (var i = DOCUMENT_FULLSCREEN_EVENTS.length; i--;) {
                document.addEventListener(DOCUMENT_FULLSCREEN_EVENTS[i], _fullscreenChangeHandler, false);
            }

            window.removeEventListener('resize', _responsiveListener);
            window.addEventListener('resize', _responsiveListener, false);
            if (_isMobile) {
                window.removeEventListener('orientationchange', _responsiveListener);
                window.addEventListener('orientationchange', _responsiveListener, false);
            }
            //this for googima, after casting, to get the state right.
            jwplayer(_api.id).onAdPlay(function() {
                _controlbar.adMode(true);
                _updateState(states.PLAYING);

                // For Vast to hide controlbar if no mouse movement
                _resetTapTimer();
            });
            jwplayer(_api.id).onAdSkipped(function() {
                _controlbar.adMode(false);
            });
            jwplayer(_api.id).onAdComplete(function() {
                _controlbar.adMode(false);
            });
            // So VAST will be in correct state when ad errors out from unknown filetype
            jwplayer(_api.id).onAdError(function() {
                _controlbar.adMode(false);
            });
            _api.jwAddEventListener(events.JWPLAYER_PLAYER_STATE, _stateHandler);
            _api.jwAddEventListener(events.JWPLAYER_MEDIA_ERROR, _errorHandler);
            _api.jwAddEventListener(events.JWPLAYER_PLAYLIST_COMPLETE, _playlistCompleteHandler);
            _api.jwAddEventListener(events.JWPLAYER_PLAYLIST_ITEM, _playlistItemHandler);
            _api.jwAddEventListener(events.JWPLAYER_CAST_AVAILABLE, function() {
                if (utils.canCast()) {
                    _this.forceControls(true);
                } else {
                    _this.releaseControls();
                }
            });

            _api.jwAddEventListener(events.JWPLAYER_CAST_SESSION, function(evt) {
                if (!_castDisplay) {
                    _castDisplay = new jwplayer.html5.castDisplay(_api.id);
                    _castDisplay.statusDelegate = function(evt) {
                        _castDisplay.setState(evt.newstate);
                    };
                }
                if (evt.active) {
                    _css.style(_captions.element(), {
                        display: 'none'
                    });
                    _this.forceControls(true);
                    _castDisplay.setState('connecting').setName(evt.deviceName).show();
                    _api.jwAddEventListener(events.JWPLAYER_PLAYER_STATE, _castDisplay.statusDelegate);
                    _api.jwAddEventListener(events.JWPLAYER_CAST_AD_CHANGED, _castAdChanged);
                } else {
                    _api.jwRemoveEventListener(events.JWPLAYER_PLAYER_STATE, _castDisplay.statusDelegate);
                    _api.jwRemoveEventListener(events.JWPLAYER_CAST_AD_CHANGED, _castAdChanged);
                    _castDisplay.hide();
                    if (_controlbar.adMode()) {
                        _castAdsEnded();
                    }
                    _css.style(_captions.element(), {
                        display: null
                    });
                    // redraw displayicon
                    _stateHandler({
                        newstate: _api.jwGetState()
                    });
                    _responsiveListener();
                }

            });

            _stateHandler({
                newstate: states.IDLE
            });

            if (!_isMobile) {
                _controlsLayer.addEventListener('mouseout', _mouseoutHandler, false);

                _controlsLayer.addEventListener('mousemove', _startFade, false);
                if (utils.isMSIE()) {
                    // Not sure why this is needed
                    _videoLayer.addEventListener('mousemove', _startFade, false);
                    _videoLayer.addEventListener('click', _display.clickHandler);
                }
            }
            _componentFadeListeners(_controlbar);
            _componentFadeListeners(_dock);
            _componentFadeListeners(_logo);

            _css('#' + _playerElement.id + '.' + ASPECT_MODE + ' .' + VIEW_ASPECT_CONTAINER_CLASS, {
                'margin-top': _model.aspectratio,
                display: JW_CSS_BLOCK
            });

            var ar = utils.exists(_model.aspectratio) ? parseFloat(_model.aspectratio) : 100,
                size = _model.playlistsize;
            _css('#' + _playerElement.id + '.playlist-right .' + VIEW_ASPECT_CONTAINER_CLASS, {
                'margin-bottom': -1 * size * (ar / 100) + 'px'
            });

            _css('#' + _playerElement.id + '.playlist-right .' + VIEW_PLAYLIST_CONTAINER_CLASS, {
                width: size + 'px',
                right: 0,
                top: 0,
                height: '100%'
            });

            _css('#' + _playerElement.id + '.playlist-bottom .' + VIEW_ASPECT_CONTAINER_CLASS, {
                'padding-bottom': size + 'px'
            });

            _css('#' + _playerElement.id + '.playlist-bottom .' + VIEW_PLAYLIST_CONTAINER_CLASS, {
                width: '100%',
                height: size + 'px',
                bottom: 0
            });

            _css('#' + _playerElement.id + '.playlist-right .' + VIEW_MAIN_CONTAINER_CLASS, {
                right: size + 'px'
            });

            _css('#' + _playerElement.id + '.playlist-bottom .' + VIEW_MAIN_CONTAINER_CLASS, {
                bottom: size + 'px'
            });

            setTimeout(function() {
                _resize(_model.width, _model.height);
            }, 0);
        };
                
        function _componentFadeListeners(comp) {
            if (comp) {
                comp.element().addEventListener('mousemove', _cancelFade, false);
                comp.element().addEventListener('mouseout', _resumeFade, false);
            }
        }

        function _captionsLoadedHandler() { //evt) {
            //ios7captions
            //_model.getVideo().addCaptions(evt.captionData);
            // set current captions evt.captionData[_api.jwGetCurrentCaptions()]
        }



        function _mouseoutHandler() {
            clearTimeout(_controlsTimeout);
            _controlsTimeout = setTimeout(_hideControls, _timeoutDuration);
        }

        function _createElement(elem, className) {
            var newElement = document.createElement(elem);
            if (className) {
                newElement.className = className;
            }
            return newElement;
        }

        function _touchHandler() {
            if (_isMobile) {
                if (_showing) {
                    _hideControls();
                } else {
                    _showControls();
                }
            } else {
                _stateHandler({
                    newstate: _api.jwGetState()
                });
            }
            if (_showing) {
                _resetTapTimer();
            }
        }

        function _resetTapTimer() {
            clearTimeout(_controlsTimeout);
            _controlsTimeout = setTimeout(_hideControls, _timeoutDuration);
        }

        function _startFade() {
            clearTimeout(_controlsTimeout);
            var state = _api.jwGetState();

            // We need _instreamMode because the state is IDLE during pre-rolls
            if (state === states.PLAYING || state === states.PAUSED || _instreamMode) {
                _showControls();
                if (!_inCB) {
                    _controlsTimeout = setTimeout(_hideControls, _timeoutDuration);
                }
            }
        }

        // Over controlbar don't fade
        function _cancelFade() {
            clearTimeout(_controlsTimeout);
            _inCB = true;
        }

        function _resumeFade() {
            _inCB = false;
        }

        function forward(evt) {
            _this.sendEvent(evt.type, evt);
        }

        function _setupControls() {
            var cbSettings = _model.componentConfig('controlbar'),
                displaySettings = _model.componentConfig('display');

            _captions = new html5.captions(_api, _model.captions);
            _captions.addEventListener(events.JWPLAYER_CAPTIONS_LIST, forward);
            _captions.addEventListener(events.JWPLAYER_CAPTIONS_CHANGED, forward);
            _captions.addEventListener(events.JWPLAYER_CAPTIONS_LOADED, _captionsLoadedHandler);
            _controlsLayer.appendChild(_captions.element());

            _display = new html5.display(_api, displaySettings);
            _display.addEventListener(events.JWPLAYER_DISPLAY_CLICK, function(evt) {
                forward(evt);
                _touchHandler();
            });

            _controlsLayer.appendChild(_display.element());

            _logo = new html5.logo(_api, _logoConfig);
            _controlsLayer.appendChild(_logo.element());

            _dock = new html5.dock(_api, _model.componentConfig('dock'));
            _controlsLayer.appendChild(_dock.element());

            if (_api.edition && !_isMobile) {
                _rightClickMenu = new html5.rightclick(_api, {
                    abouttext: _model.abouttext,
                    aboutlink: _model.aboutlink
                });
            } else if (!_isMobile) {
                _rightClickMenu = new html5.rightclick(_api, {});
            }

            if (_model.playlistsize && _model.playlistposition && _model.playlistposition !== JW_CSS_NONE) {
                _playlist = new html5.playlistcomponent(_api, {});
                _playlistLayer.appendChild(_playlist.element());
            }

            _controlbar = new html5.controlbar(_api, cbSettings);
            _controlbar.addEventListener(events.JWPLAYER_USER_ACTION, _resetTapTimer);

            _controlsLayer.appendChild(_controlbar.element());

            if (_isIPod) {
                _hideControlbar();
            }
            if (utils.canCast()) {
                _this.forceControls(true);
            }
            
            _playerElement.onmousedown = handleMouseDown;
            _playerElement.onfocusin = handleFocus;
            _playerElement.addEventListener('focus', handleFocus);
            _playerElement.onfocusout = handleBlur;
            _playerElement.addEventListener('blur', handleBlur);
            _playerElement.addEventListener('keydown', handleKeydown);
        }

        function _castAdChanged(evt) {
            // end ad mode (ad provider removed)
            if (evt.done) {
                _castAdsEnded();
                return;
            }

            if (!evt.complete) {
                // start ad mode
                if (!_controlbar.adMode()) {
                    _castAdsStarted();
                }

                _controlbar.setText(evt.message);

                // clickthrough callback
                var clickAd = evt.onClick;
                if (clickAd !== undefined) {
                    _display.setAlternateClickHandler(function() {
                        clickAd(evt);
                    });
                }
                //skipAd callback
                var skipAd = evt.onSkipAd;
                if (skipAd !== undefined && _castDisplay) {
                    _castDisplay.setSkipoffset(evt, evt.onSkipAd);
                }
            }

            // update skip button and companions
            if (_castDisplay) {
                _castDisplay.adChanged(evt);
            }

        }

        function _castAdsStarted() {
            _controlbar.instreamMode(true);
            _controlbar.adMode(true);
            _controlbar.show(true);
        }

        function _castAdsEnded() {
            // controlbar reset
            _controlbar.setText('');
            _controlbar.adMode(false);
            _controlbar.instreamMode(false);
            _controlbar.show(true);
            // cast display reset
            if (_castDisplay) {
                _castDisplay.adsEnded();
                _castDisplay.setState(_api.jwGetState());
            }
            // display click reset
            _display.revertAlternateClickHandler();
        }

        /** 
         * Switch fullscreen mode.
         **/
        var _fullscreen = this.fullscreen = function(state) {

            if (!utils.exists(state)) {
                state = !_model.fullscreen;
            }

            state = !!state;

            // if state is already correct, return
            if (state === _model.fullscreen) {
                return;
            }

            // If it supports DOM fullscreen
            if (_elementSupportsFullscreen) {
                if (state) {
                    _requestFullscreen.apply(_playerElement);
                } else {
                    _exitFullscreen.apply(document);
                }
                _toggleDOMFullscreen(_playerElement, state);
            } else {
                if (utils.isIE()) {
                    _toggleDOMFullscreen(_playerElement, state);
                } else {
                    // else use native fullscreen
                    if (_instreamModel) {
                       _instreamModel.getVideo().setFullScreen(state); 
                    }
                       _model.getVideo().setFullScreen(state);
                }
            }
        };


        function _redrawComponent(comp) {
            if (comp) {
                comp.redraw();
            }
        }

        /**
         * Resize the player
         */
        function _resize(width, height, resetAspectMode) {
            var className = _playerElement.className,
                playerStyle,
                playlistStyle,
                containerStyle,
                playlistSize,
                playlistPos,
                id = _api.id + '_view';
            _css.block(id);

            // when jwResize is called remove aspectMode and force layout
            resetAspectMode = !!resetAspectMode;
            if (resetAspectMode) {
                className = className.replace(/\s*aspectMode/, '');
                if (_playerElement.className !== className) {
                    _playerElement.className = className;
                }
                _css.style(_playerElement, {
                    display: JW_CSS_BLOCK
                }, resetAspectMode);
            }

            if (utils.exists(width) && utils.exists(height)) {
                _model.width = width;
                _model.height = height;
            }

            playerStyle = {
                width: width
            };
            if (className.indexOf(ASPECT_MODE) === -1) {
                playerStyle.height = height;
            }
            _css.style(_playerElement, playerStyle, true);

            if (_display) {
                _display.redraw();
            }
            if (_controlbar) {
                _controlbar.redraw(true);
            }
            if (_logo) {
                _logo.offset(_controlbar && _logo.position().indexOf('bottom') >= 0 ?
                    _controlbar.height() + _controlbar.margin() : 0);
                setTimeout(function() {
                    if (_dock) {
                        _dock.offset(_logo.position() === 'top-left' ?
                            _logo.element().clientWidth + _logo.margin() : 0);
                    }
                }, 500);
            }

            _checkAudioMode(height);

            playlistSize = _model.playlistsize;
            playlistPos = _model.playlistposition;
            if (_playlist && playlistSize && (playlistPos === 'right' || playlistPos === 'bottom')) {
                _playlist.redraw();

                playlistStyle = {
                    display: JW_CSS_BLOCK
                };
                containerStyle = {};

                playlistStyle[playlistPos] = 0;
                containerStyle[playlistPos] = playlistSize;

                if (playlistPos === 'right') {
                    playlistStyle.width = playlistSize;
                } else {
                    playlistStyle.height = playlistSize;
                }

                _css.style(_playlistLayer, playlistStyle);
                _css.style(_container, containerStyle);
            }

            // pass width, height from jwResize if present 
            _resizeMedia(width, height);

            _css.unblock(id);
        }

        function _checkAudioMode(height) {
            _audioMode = _isAudioMode(height);
            if (_controlbar) {
                if (_audioMode) {
                    _controlbar.audioMode(true);
                    _showControls();
                    _display.hidePreview(true);
                    _hideDisplay();
                    _showVideo(false);
                } else {
                    _controlbar.audioMode(false);
                    _updateState(_api.jwGetState());
                }
            }
            if (_logo && _audioMode) {
                _hideLogo();
            }
            _playerElement.style.backgroundColor = _audioMode ? 'transparent' : '#000';
        }

        function _isAudioMode(height) {
            if (_model.aspectratio) {
                return false;
            }
            if (jwplayer._.isNumber(height)) {
                return _isControlBarOnly(height);
            }
            if (jwplayer._.isString(height) && height.indexOf('%') > -1) {
                return false;
            }
            var bounds = _bounds(_playerElement);
            return _isControlBarOnly(bounds.height);
        }

        function _isControlBarOnly(verticalPixels) {
            if (!verticalPixels) {
                return false;
            }
            if (_model.playlistposition === 'bottom') {
                verticalPixels -= _model.playlistsize;
            }
            return verticalPixels <= 40;
        }

        function _resizeMedia(width, height) {
            if (!width || isNaN(Number(width))) {
                if (!_videoLayer) {
                    return;
                }
                width = _videoLayer.clientWidth;
            }
            if (!height || isNaN(Number(height))) {
                if (!_videoLayer) {
                    return;
                }
                height = _videoLayer.clientHeight;
            }
            //IE9 Fake Full Screen Fix
            if (utils.isMSIE(9) && document.all && !window.atob) {
                width = height = '100%';
            }

            var transformScale = _model.getVideo().resize(width, height, _model.stretching);
            // poll resizing if video is transformed
            if (transformScale) {
                clearTimeout(_resizeMediaTimeout);
                _resizeMediaTimeout = setTimeout(_resizeMedia, 250);
            }
        }

        this.resize = function(width, height) {
            var resetAspectMode = true;
            _resize(width, height, resetAspectMode);
            _responsiveListener();
        };
        this.resizeMedia = _resizeMedia;

        var _completeSetup = this.completeSetup = function() {
            _css.style(_playerElement, {
                opacity: 1
            });
            window.addEventListener('beforeunload', function() {
                if (!_isCasting()) { // don't call stop while casting
                    // prevent video error in display on window close
                    _api.jwStop();
                }
            });
        };

        /**
         * Return whether or not we're in native fullscreen
         */
        function _isNativeFullscreen() {
            if (_elementSupportsFullscreen) {
                var fsElement = document.fullscreenElement ||
                    document.webkitCurrentFullScreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement;
                return !!(fsElement && fsElement.id === _api.id);
            }
            // if player element view fullscreen not available, return video fullscreen state
            return  _instreamMode ? _instreamModel.getVideo().getFullScreen() :
                        _model.getVideo().getFullScreen();
        }


        function _fullscreenChangeHandler(event) {
            var fullscreenState = (event.jwstate !== undefined) ? event.jwstate : _isNativeFullscreen();
            if (_elementSupportsFullscreen) {
                _toggleDOMFullscreen(_playerElement, fullscreenState);
            } else {
                _toggleFullscreen(fullscreenState);
            }
        }

        function _toggleDOMFullscreen(playerElement, fullscreenState) {
            utils.removeClass(playerElement, 'jwfullscreen');
            if (fullscreenState) {
                utils.addClass(playerElement, 'jwfullscreen');
                _css.style(document.body, {
                    'overflow-y': JW_CSS_HIDDEN
                });

                // On going fullscreen we want the control bar to fade after a few seconds
                _resetTapTimer();
            } else {
                _css.style(document.body, {
                    'overflow-y': ''
                });
            }

            _redrawComponent(_controlbar);
            _redrawComponent(_display);
            _redrawComponent(_dock);
            _resizeMedia();

            _toggleFullscreen(fullscreenState);
        }

        function _toggleFullscreen(fullscreenState) {
            // update model
            _model.setFullscreen(fullscreenState);
            if (_instreamModel) {
                _instreamModel.setFullscreen(fullscreenState);
            }

            if (fullscreenState) {
                // Browsers seem to need an extra second to figure out how large they are in fullscreen...
                clearTimeout(_resizeMediaTimeout);
                _resizeMediaTimeout = setTimeout(_resizeMedia, 200);

            } else if (_isIPad && _api.jwGetState() === states.PAUSED) {
                // delay refresh on iPad when exiting fullscreen
                // TODO: cancel this if fullscreen or player state changes
                setTimeout(_showDisplay, 500);
            }
        }

        function _showControlbar() {
            if (_controlbar && _model.controls) {
                if (_instreamMode) {
                    _instreamControlbar.show();
                } else {
                    _controlbar.show();
                }
            }
        }

        function _hideControlbar() {
            if (_forcedControlsState === true) {
                return;
            }

            // TODO: use _forcedControlsState for audio mode so that we don't need these
            if (_controlbar && !_audioMode && !_model.getVideo().isAudioFile()) {
                if (_instreamMode) {
                    _instreamControlbar.hide();
                }

                _controlbar.hide();
            }
        }

        function _showDock() {
            if (_dock && !_audioMode && _model.controls) {
                _dock.show();
            }
        }

        function _hideDock() {
            if (_dock && !_replayState && !_model.getVideo().isAudioFile()) {
                _dock.hide();
            }
        }

        function _showLogo() {
            if (_logo && !_audioMode) {
                _logo.show();
            }
        }

        function _hideLogo() {
            if (_logo && (!_model.getVideo().isAudioFile() || _audioMode)) {
                _logo.hide(_audioMode);
            }
        }

        function _showDisplay() {
            if (_display && _model.controls && !_audioMode) {
                if (!_isIPod || _api.jwGetState() === states.IDLE) {
                    _display.show();
                }
            }

            // debug this, find out why
            if (!(_isMobile && _model.fullscreen)) {
                _model.getVideo().setControls(false);
            }
        }

        function _hideDisplay() {
            if (_display) {
                _display.hide();
            }
        }

        function _hideControls() {
            clearTimeout(_controlsTimeout);
            if (_forcedControlsState === true) {
                return;
            }
            _showing = false;

            var state = _api.jwGetState();

            if (!_model.controls || state !== states.PAUSED) {
                _hideControlbar();
            }

            if (!_model.controls) {
                _hideDock();
            }

            if (state !== states.IDLE && state !== states.PAUSED) {
                _hideDock();
                _hideLogo();
            }

            utils.addClass(_playerElement, 'jw-user-inactive');
        }

        function _showControls() {
            if (_forcedControlsState === false) {
                return;
            }

            _showing = true;
            if (_model.controls || _audioMode) {
                _showControlbar();
                _showDock();
            }
            if (_logoConfig.hide) {
                _showLogo();
            }

            utils.removeClass(_playerElement, 'jw-user-inactive');
        }

        function _showVideo(state) {
            state = state && !_audioMode;
            _model.getVideo().setVisibility(state);
        }

        function _playlistCompleteHandler() {
            _replayState = true;
            _fullscreen(false);
            if (_model.controls) {
                _showDock();
            }
        }

        function _playlistItemHandler() {
            // update display title
            if (_castDisplay) {
                _castDisplay.setState(_api.jwGetState());
            }
        }

        /**
         * Player state handler
         */
        var _stateTimeout;

        function _stateHandler(evt) {
            _replayState = false;
            clearTimeout(_stateTimeout);
            _stateTimeout = setTimeout(function() {
                _updateState(evt.newstate);
            }, 100);
        }

        function _errorHandler() {
            _hideControlbar();
        }

        function _isAudioFile() {
            var model = _instreamMode ? _instreamModel : _model;
            return model.getVideo().isAudioFile();
        }

        function _isCasting() {
            return _model.getVideo().isCaster;
        }

        function _updateState(state) {
            _currentState = state;
            // cast.display
            if (_isCasting()) {
                if (_display) {
                    _display.show();
                    _display.hidePreview(false);
                }
                // hide video without audio and android checks
                _css.style(_videoLayer, {
                    visibility: 'visible',
                    opacity: 1
                });

                // force control bar without audio check
                if (_controlbar) {
                    _controlbar.show();
                    _controlbar.hideFullscreen(true);
                }
                return;
            }
            // player display
            switch (state) {
                case states.PLAYING:
                    if (_model.getVideo().isCaster !== true) {
                        _forcedControlsState = null;
                    } else {
                        _forcedControlsState = true;
                    }
                    if (_isAudioFile()) {
                        _showVideo(false);
                        _display.hidePreview(_audioMode);
                        _display.setHiding(true);
                        if (_controlbar) {
                            _showControls();
                            _controlbar.hideFullscreen(true);
                        }
                        _showDock();
                    } else {
                        _showVideo(true);

                        _resizeMedia();
                        _display.hidePreview(true);
                        if (_controlbar) {
                            _controlbar.hideFullscreen(!_model.getVideo().supportsFullscreen());
                        }
                    }
                    break;
                case states.IDLE:
                    _showVideo(false);
                    if (!_audioMode) {
                        _display.hidePreview(false);
                        _showDisplay();
                        _showDock();
                        if (_controlbar) {
                            _controlbar.hideFullscreen(false);
                        }
                    }
                    break;
                case states.BUFFERING:
                    _showDisplay();
                    _hideControls();
                    if (_isMobile) {
                        _showVideo(true);
                    }
                    break;
                case states.PAUSED:
                    _showDisplay();
                    _showControls();
                    break;
            }

            _showLogo();
        }

        function _internalSelector(className) {
            return '#' + _api.id + (className ? ' .' + className : '');
        }

        this.setupInstream = function(instreamContainer, instreamControlbar, instreamDisplay, instreamModel) {
            _css.unblock();
            _setVisibility(_internalSelector(VIEW_INSTREAM_CONTAINER_CLASS), true);
            _setVisibility(_internalSelector(VIEW_CONTROLS_CONTAINER_CLASS), false);
            _instreamLayer.appendChild(instreamContainer);
            _instreamControlbar = instreamControlbar;
            _instreamDisplay = instreamDisplay;
            _instreamModel = instreamModel;
            _stateHandler({
                newstate: states.PLAYING
            });
            _instreamMode = true;
            _instreamLayer.addEventListener('mousemove', _startFade);
            _instreamLayer.addEventListener('mouseout', _mouseoutHandler);
        };

        this.destroyInstream = function() {
            _css.unblock();
            _setVisibility(_internalSelector(VIEW_INSTREAM_CONTAINER_CLASS), false);
            _setVisibility(_internalSelector(VIEW_CONTROLS_CONTAINER_CLASS), true);
            _instreamLayer.innerHTML = '';
            _instreamLayer.removeEventListener('mousemove', _startFade);
            _instreamLayer.removeEventListener('mouseout', _mouseoutHandler);
            _instreamMode = false;
        };

        this.setupError = function(message) {
            _errorState = true;
            jwplayer.embed.errorScreen(_playerElement, message, _model);
            _completeSetup();
        };

        function _setVisibility(selector, state) {
            _css(selector, {
                display: state ? JW_CSS_BLOCK : JW_CSS_NONE
            });
        }

        this.addButton = function(icon, label, handler, id) {
            if (_dock) {
                _dock.addButton(icon, label, handler, id);
                if (_api.jwGetState() === states.IDLE) {
                    _showDock();
                }
            }
        };

        this.removeButton = function(id) {
            if (_dock) {
                _dock.removeButton(id);
            }
        };

        this.setControls = function(state) {

            var newstate = !!state;
            if (newstate === _model.controls) {
                return;
            }

            _model.controls = newstate;

            if (_instreamMode) {
                _hideInstream(!state);
            } else {
                if (newstate) {
                    _stateHandler({
                        newstate: _api.jwGetState()
                    });
                }
            }

            if (!newstate) {
                _hideControls();
                _hideDisplay();
            }

            _this.sendEvent(events.JWPLAYER_CONTROLS, {
                controls: newstate
            });
        };

        this.forceControls = function(state) {
            _forcedControlsState = !!state;
            if (state) {
                _showControls();
            } else {
                _hideControls();
            }
        };

        this.releaseControls = function() {
            _forcedControlsState = null;
            _updateState(_api.jwGetState());
        };

        function _hideInstream(hidden) {
            if (hidden) {
                _instreamControlbar.hide();
                _instreamDisplay.hide();
            } else {
                _instreamControlbar.show();
                _instreamDisplay.show();
            }
        }

        this.addCues = function(cues) {
            if (_controlbar) {
                _controlbar.addCues(cues);
            }
        };

        this.forceState = function(state) {
            _display.forceState(state);
        };

        this.releaseState = function() {
            _display.releaseState(_api.jwGetState());
        };

        this.getSafeRegion = function(includeCB) {
            var bounds = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            
            includeCB = includeCB || !utils.exists(includeCB);


            _controlbar.showTemp();
            _dock.showTemp();
            //_responsiveListener();
            var dispBounds = _bounds(_container),
                dispOffset = dispBounds.top,
                cbBounds = _instreamMode ?
                _bounds(document.getElementById(_api.id + '_instream_controlbar')) :
                _bounds(_controlbar.element()),
                dockButtons = _instreamMode ? false : (_dock.numButtons() > 0),
                logoTop = (_logo.position().indexOf('top') === 0),
                dockBounds,
                logoBounds = _bounds(_logo.element());
            if (dockButtons && _model.controls) {
                dockBounds = _bounds(_dock.element());
                bounds.y = Math.max(0, dockBounds.bottom - dispOffset);
            }
            if (logoTop) {
                bounds.y = Math.max(bounds.y, logoBounds.bottom - dispOffset);
            }
            bounds.width = dispBounds.width;
            if (cbBounds.height && includeCB && _model.controls) {
                bounds.height = (logoTop ? cbBounds.top : logoBounds.top) - dispOffset - bounds.y;
            } else {
                bounds.height = dispBounds.height - bounds.y;
            }
            _controlbar.hideTemp();
            _dock.hideTemp();
            return bounds;
        };

        this.destroy = function() {
            window.removeEventListener('resize', _responsiveListener);
            window.removeEventListener('orientationchange', _responsiveListener);
            for (var i = DOCUMENT_FULLSCREEN_EVENTS.length; i--;) {
                document.removeEventListener(DOCUMENT_FULLSCREEN_EVENTS[i], _fullscreenChangeHandler, false);
            }
            _model.removeEventListener('fullscreenchange', _fullscreenChangeHandler);
            _playerElement.removeEventListener('keydown', handleKeydown, false);
            if (_rightClickMenu) {
                _rightClickMenu.destroy();
            }
            if (_castDisplay) {
                _api.jwRemoveEventListener(events.JWPLAYER_PLAYER_STATE, _castDisplay.statusDelegate);
                _castDisplay.destroy();
                _castDisplay = null;
            }
            if (_controlsLayer) {
                _controlsLayer.removeEventListener('mousemove', _startFade);
                _controlsLayer.removeEventListener('mouseout', _mouseoutHandler);
            }
            if (_videoLayer) {
                _videoLayer.removeEventListener('mousemove', _startFade);
                _videoLayer.removeEventListener('click', _display.clickHandler);
            }
            if (_instreamMode) {
                this.destroyInstream();
            }
        };

        _init();
    };

    // Container styles
    _css('.' + PLAYER_CLASS, {
        position: 'relative',
        // overflow: 'hidden',
        display: 'block',
        opacity: 0,
        'min-height': 0,
        '-webkit-transition': JW_CSS_SMOOTH_EASE,
        '-moz-transition': JW_CSS_SMOOTH_EASE,
        '-o-transition': JW_CSS_SMOOTH_EASE
    });

    _css('.' + VIEW_MAIN_CONTAINER_CLASS, {
        position: JW_CSS_ABSOLUTE,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        '-webkit-transition': JW_CSS_SMOOTH_EASE,
        '-moz-transition': JW_CSS_SMOOTH_EASE,
        '-o-transition': JW_CSS_SMOOTH_EASE
    });

    _css('.' + VIEW_VIDEO_CONTAINER_CLASS + ', .' + VIEW_CONTROLS_CONTAINER_CLASS, {
        position: JW_CSS_ABSOLUTE,
        height: JW_CSS_100PCT,
        width: JW_CSS_100PCT,
        '-webkit-transition': JW_CSS_SMOOTH_EASE,
        '-moz-transition': JW_CSS_SMOOTH_EASE,
        '-o-transition': JW_CSS_SMOOTH_EASE
    });

    _css('.' + VIEW_VIDEO_CONTAINER_CLASS, {
        overflow: JW_CSS_HIDDEN,
        visibility: JW_CSS_HIDDEN,
        opacity: 0
    });

    _css('.' + VIEW_VIDEO_CONTAINER_CLASS + ' video', {
        background: 'transparent',
        height: JW_CSS_100PCT,
        width: JW_CSS_100PCT,
        position: 'absolute',
        margin: 'auto',
        right: 0,
        left: 0,
        top: 0,
        bottom: 0
    });

    _css('.' + VIEW_PLAYLIST_CONTAINER_CLASS, {
        position: JW_CSS_ABSOLUTE,
        height: JW_CSS_100PCT,
        width: JW_CSS_100PCT,
        display: JW_CSS_NONE
    });

    _css('.' + VIEW_INSTREAM_CONTAINER_CLASS, {
        position: JW_CSS_ABSOLUTE,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: 'none'
    });


    _css('.' + VIEW_ASPECT_CONTAINER_CLASS, {
        display: 'none'
    });

    _css('.' + PLAYER_CLASS + '.' + ASPECT_MODE, {
        height: 'auto'
    });

    // Fullscreen styles

    _css(FULLSCREEN_SELECTOR, {
        width: JW_CSS_100PCT,
        height: JW_CSS_100PCT,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        'z-index': 1000,
        margin: 0,
        position: 'fixed'
    }, true);

    // hide cursor in fullscreen
    _css(FULLSCREEN_SELECTOR + '.jw-user-inactive', {
        'cursor': 'none',
        '-webkit-cursor-visibility': 'auto-hide'
    });

    _css(FULLSCREEN_SELECTOR + ' .' + VIEW_MAIN_CONTAINER_CLASS, {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    }, true);

    _css(FULLSCREEN_SELECTOR + ' .' + VIEW_PLAYLIST_CONTAINER_CLASS, {
        display: JW_CSS_NONE
    }, true);

    _css('.' + PLAYER_CLASS + ' .jwuniform', {
        'background-size': 'contain' + JW_CSS_IMPORTANT
    });

    _css('.' + PLAYER_CLASS + ' .jwfill', {
        'background-size': 'cover' + JW_CSS_IMPORTANT,
        'background-position': 'center'
    });

    _css('.' + PLAYER_CLASS + ' .jwexactfit', {
        'background-size': JW_CSS_100PCT + ' ' + JW_CSS_100PCT + JW_CSS_IMPORTANT
    });
})(window);
