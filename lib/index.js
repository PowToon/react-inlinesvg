'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _once = require('once');

var _once2 = _interopRequireDefault(_once);

var _httpplease = require('httpplease');

var _httpplease2 = _interopRequireDefault(_httpplease);

var _oldiexdomain = require('httpplease/plugins/oldiexdomain');

var _oldiexdomain2 = _interopRequireDefault(_oldiexdomain);

var _shouldComponentUpdate = require('./shouldComponentUpdate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var http = _httpplease2.default.use(_oldiexdomain2.default);

var Status = {
  PENDING: 'pending',
  LOADING: 'loading',
  LOADED: 'loaded',
  FAILED: 'failed',
  UNSUPPORTED: 'unsupported'
};

var getRequestsByUrl = {};
var loadedIcons = {};

var createGetOrUseCacheForUrl = function createGetOrUseCacheForUrl(context, url, requestFunction, callback) {
  if (loadedIcons[url]) {
    var params = loadedIcons[url];

    context._pendingTimeout = setTimeout(function () {
      context._pendingTimeout = null;
      callback(params[0], params[1]);
    }, 0);
  }

  if (!getRequestsByUrl[url]) {
    getRequestsByUrl[url] = [];

    context._pendingRequest = requestFunction(url, function (err, svgText) {
      getRequestsByUrl[url].forEach(function (cb) {
        loadedIcons[url] = [err, svgText];
        cb(err, svgText);
      });
    });
  }

  getRequestsByUrl[url].push(callback);
};

var supportsInlineSVG = (0, _once2.default)(function () {
  if (!document) {
    return false;
  }

  var div = document.createElement('div');
  div.innerHTML = '<svg />';
  return div.firstChild && div.firstChild.namespaceURI === 'http://www.w3.org/2000/svg';
});

var isSupportedEnvironment = (0, _once2.default)(function () {
  return ((typeof window !== 'undefined' && window !== null ? window.XMLHttpRequest : false) || (typeof window !== 'undefined' && window !== null ? window.XDomainRequest : false)) && supportsInlineSVG();
});

var uniquifyIDs = function () {
  var mkAttributePattern = function mkAttributePattern(attr) {
    return '(?:(?:\\s|\\:)' + attr + ')';
  };

  var idPattern = new RegExp('(?:(' + mkAttributePattern('id') + ')="([^"]+)")|(?:(' + mkAttributePattern('href') + '|' + mkAttributePattern('role') + '|' + mkAttributePattern('arcrole') + ')="\\#([^"]+)")|(?:="url\\(\\\'?\\#([^\\)]+?)\\\'?\\)")', 'g');

  return function (svgText, svgID) {
    var uniquifyID = function uniquifyID(id) {
      return id + '___' + svgID;
    };

    return svgText.replace(idPattern, function (m, p1, p2, p3, p4, p5) {
      //eslint-disable-line consistent-return
      if (p2) {
        return p1 + '="' + uniquifyID(p2) + '"';
      } else if (p4) {
        return p3 + '="#' + uniquifyID(p4) + '"';
      } else if (p5) {
        return '="url(#' + uniquifyID(p5) + ')"';
      }
    });
  };
}();

var getHash = function getHash(str) {
  var chr = void 0;
  var hash = 0;
  var i = void 0;
  var j = void 0;
  var ref = void 0;

  if (!str) {
    return hash;
  }

  for (i = j = 0, ref = str.length; ref >= 0 ? j < ref : j > ref; i = ref >= 0 ? ++j : --j) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash &= hash;
  }

  return hash;
};

var InlineSVGError = function (_Error) {
  _inherits(InlineSVGError, _Error);

  function InlineSVGError(message) {
    var _ret;

    _classCallCheck(this, InlineSVGError);

    var _this = _possibleConstructorReturn(this, (InlineSVGError.__proto__ || Object.getPrototypeOf(InlineSVGError)).call(this));

    _this.name = 'InlineSVGError';
    _this.isSupportedBrowser = true;
    _this.isConfigurationError = false;
    _this.isUnsupportedBrowserError = false;
    _this.message = message;

    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  return InlineSVGError;
}(Error);

var createError = function createError(message, attrs) {
  var err = new InlineSVGError(message);

  Object.keys(attrs).forEach(function (k) {
    err[k] = attrs[k];
  });

  return err;
};

var unsupportedBrowserError = function unsupportedBrowserError(message) {
  var newMessage = message;

  if (newMessage === null) {
    newMessage = 'Unsupported Browser';
  }

  return createError(newMessage, {
    isSupportedBrowser: false,
    isUnsupportedBrowserError: true
  });
};

var configurationError = function configurationError(message) {
  return createError(message, {
    isConfigurationError: true
  });
};

var InlineSVG = function (_React$Component) {
  _inherits(InlineSVG, _React$Component);

  function InlineSVG(props) {
    _classCallCheck(this, InlineSVG);

    var _this2 = _possibleConstructorReturn(this, (InlineSVG.__proto__ || Object.getPrototypeOf(InlineSVG)).call(this, props));

    _this2.shouldComponentUpdate = _shouldComponentUpdate.shouldComponentUpdate;


    _this2.state = {
      status: Status.PENDING
    };

    _this2.handleLoad = _this2.handleLoad.bind(_this2);
    _this2.makeRequest = _this2.makeRequest.bind(_this2);
    return _this2;
  }

  _createClass(InlineSVG, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      //Abort pending request to prevent an error if the request completes after the component is unmounted
      this._abortPendingRequest = true;
      if (this._pendingRequest) {
        if (this._pendingRequest.abort) {
          this._pendingRequest.abort();
        }
      }
      if (this._pendingTimeout) {
        clearTimeout(this._pendingTimeout);
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.srcUpdated();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.src !== this.props.src) {
        this.srcUpdated();
      }
    }
  }, {
    key: 'srcUpdated',
    value: function srcUpdated() {
      if (this.props.supportTest()) {
        if (this.props.src) {
          this.startLoad();
        } else {
          this.fail(configurationError('Missing source'));
        }
      } else {
        this.fail(unsupportedBrowserError());
      }
    }
  }, {
    key: 'makeRequest',
    value: function makeRequest(src, cb) {
      return this.props.requestFunction(src, cb);
    }
  }, {
    key: 'fail',
    value: function fail(error) {
      var _this3 = this;

      var status = error.isUnsupportedBrowserError ? Status.UNSUPPORTED : Status.FAILED;

      this.setState({ status: status }, function () {
        if (typeof _this3.props.onError === 'function') {
          _this3.props.onError(error);
        }
      });
    }
  }, {
    key: 'handleLoad',
    value: function handleLoad(err, svgText) {
      var _this4 = this;

      this._pendingRequest = null;

      if (!err && this._abortPendingRequest) {
        err = new Error('Aborted svg loading.');
        err.name = 'Abort';
      }

      if (err) {
        if (err.name !== 'Abort') {
          this.fail(err);
        }

        return;
      }

      this.processSVG(svgText, function (processedSvgText) {
        _this4.setState({
          svgText: processedSvgText,
          status: Status.LOADED
        }, function () {
          return typeof _this4.props.onLoad === 'function' ? _this4.props.onLoad() : null;
        });
      });
    }
  }, {
    key: 'startLoad',
    value: function startLoad() {
      this.setState({
        status: Status.LOADING
      }, this.load);
    }
  }, {
    key: 'load',
    value: function load() {
      var match = this.props.src.match(/data:image\/svg[^,]*?(;base64)?,(.*)/);
      if (match) {
        var svgText = match[1] ? atob(match[2]) : decodeURIComponent(match[2]);
        return this.handleLoad(null, svgText);
      }

      if (this.props.cacheGetRequests) {
        return createGetOrUseCacheForUrl(this, this.props.src, this.makeRequest, this.handleLoad);
      }

      return this._pendingRequest = this.makeRequest(this.props.src, this.handleLoad);
    }
  }, {
    key: 'getClassName',
    value: function getClassName() {
      var className = 'isvg ' + this.state.status;

      if (this.props.className) {
        className += ' ' + this.props.className;
      }

      return className;
    }
  }, {
    key: 'processSVG',
    value: function processSVG(svgText, callback) {
      if (this.props.uniquifyIDs) {
        svgText = uniquifyIDs(svgText, getHash(this.props.src));
      }

      this.props.processSvg(svgText, this.props.src, function (value) {
        callback(value);
      });
    }
  }, {
    key: 'renderContents',
    value: function renderContents() {
      switch (this.state.status) {
        case Status.UNSUPPORTED:
        case Status.FAILED:
          return this.props.children;
        default:
          return this.props.preloader;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.wrapper({
        className: this.getClassName(),
        dangerouslySetInnerHTML: this.state.svgText ? {
          __html: this.state.svgText
        } : undefined
      }, this.renderContents());
    }
  }]);

  return InlineSVG;
}(_react2.default.Component);

InlineSVG.propTypes = {
  cacheGetRequests: _propTypes2.default.bool,
  children: _propTypes2.default.node,
  className: _propTypes2.default.string,
  onError: _propTypes2.default.func,
  onLoad: _propTypes2.default.func,
  preloader: _propTypes2.default.func,
  src: _propTypes2.default.string.isRequired,
  supportTest: _propTypes2.default.func,
  uniquifyIDs: _propTypes2.default.bool,
  wrapper: _propTypes2.default.func,
  requestFunction: _propTypes2.default.func,
  processSvg: _propTypes2.default.func
};
InlineSVG.defaultProps = {
  wrapper: _react2.default.DOM.span,
  supportTest: isSupportedEnvironment,
  uniquifyIDs: true,
  cacheGetRequests: false,
  requestFunction: function XHRRequest(src, cb) {
    return http.get(src, function (err, res) {
      if (err) {
        cb(err);
      } else {
        var svgText = res.text;
        cb(svgText);
      }
    });
  },
  processSvg: function processSvg(svgText, callback) {
    callback(svgText);
  }
};
exports.default = InlineSVG;
module.exports = exports['default'];