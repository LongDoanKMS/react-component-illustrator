'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = exports.default = undefined;

var _isExtensible = require('babel-runtime/core-js/object/is-extensible');

var _isExtensible2 = _interopRequireDefault(_isExtensible);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _util = require('./util');

var _dox = require('dox');

var _dox2 = _interopRequireDefault(_dox);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _reactDocgen = require('react-docgen');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _acornJsx = require('acorn-jsx');

var _acornJsx2 = _interopRequireDefault(_acornJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import {simple as walkNode} from 'acorn-jsx-walk/lib/walk';

// ---

var Illustrator = function () {
  function Illustrator(options) {
    (0, _classCallCheck3.default)(this, Illustrator);

    this.options = options;
    this.store = {};
  }

  // ---

  (0, _createClass3.default)(Illustrator, [{
    key: 'record',
    value: function record(key) {
      var _this = this;

      return function (value) {
        return _this.store[key] = value;
      };
    }
  }, {
    key: 'processExample',
    value: function processExample(file) {
      var _this2 = this;

      return _promise2.default.resolve(file).then(this.record('examplePath')).then(function () {
        return _this2.relativePath(file);
      }).then(this.record('exampleRequirePath')).then(function () {
        return _get__('fs').readFileSync(file, { encoding: 'utf-8' });
      }).then(this.record('exampleSource')).then(this.parseExampleDoc.bind(this)).then(this.record('exampleDoc')).catch(function (e) {
        console.error('Could not parse: ', file);
      });
    }
  }, {
    key: 'processComponent',
    value: function processComponent(file) {
      var _this3 = this;

      return _promise2.default.resolve(file).then(this.record('componentPath')).catch(function (e) {
        console.error('Could not record(\'componentPath\'): ', file);
      }).then(function (file) {
        return _get__('toRelativeJsPath')(_this3.store.examplePath, file);
      }).catch(function (e) {
        console.error('Could not toRelativeJsPath: ', file);
      }).then(function (file) {
        return _get__('fs').readFileSync(file, { encoding: 'utf-8' });
      }).catch(function (e) {
        console.error('Could not utf-8 encode: ', file);
      }).then(this.record('componentSource')).catch(function (e) {
        console.error('Could not componentSource: ', file);
      }).then(this.parseComponentDoc).catch(function (e) {
        console.error('Could not parseComponentDoc: ', file);
      }).then(this.record('componentDoc')).catch(function (e) {
        console.error('Could not parse: ', file);
      });
    }
  }, {
    key: 'parseExampleDoc',
    value: function parseExampleDoc(code) {
      return _get__('dox').parseComments(code, this.options.doxOptions)[0];
    }
  }, {
    key: 'parseComponentDoc',
    value: function parseComponentDoc(code) {
      return _get__('parseReactDoc')(code);
    }
  }, {
    key: 'relativePath',
    value: function relativePath() {
      var _get__2;

      var paths = (0, _from2.default)(arguments, function (p) {
        return _get__('path').resolve(p);
      });
      paths.unshift(this.options.dest ? _get__('path').dirname(this.options.dest) : _get__('path').resolve('.'));

      var relative = (_get__2 = _get__('path')).relative.apply(_get__2, (0, _toConsumableArray3.default)(paths));

      if (relative[0] !== '.') {
        relative = '.' + _get__('path').sep + relative;
      }

      return relative;
    }
  }, {
    key: 'run',
    value: function run() {
      var _this4 = this;

      var component = this.store.componentPath ? (0, _extends3.default)({
        name: _get__('path').basename(this.store.componentPath, _get__('path').extname(this.store.componentPath)),
        path: _get__('path').resolve(this.store.componentPath),
        source: this.store.componentSource
      }, this.store.componentDoc) : null;

      _get__('acorn')(this.store.exampleSource, {
        ecmaVersion: 8,
        MethodDefinition: function MethodDefinition(node) {
          return node.key.name === 'render' && _this4.record('exampleRender')(_get__('recast').print(node).code);
        },
        plugins: {
          jsx: true
        }
      });

      var example = {
        name: this.getCommentTag('name').string,
        path: _get__('path').resolve(this.store.examplePath),
        requirePath: this.store.exampleRequirePath,
        description: this.store.exampleDoc.description.full,
        source: this.store.exampleSource,
        renderSource: this.store.exampleRender
      };

      return {
        component: component,
        example: example
      };
    }
  }, {
    key: 'getCommentTag',
    value: function getCommentTag(name) {
      var results = this.store.exampleDoc.tags.filter(function (tag) {
        return tag.type === name;
      });
      return results.length ? results[0] : {};
    }
  }, {
    key: 'component',
    get: function get() {
      if (this.store.componentPath) {
        return this.store.componentPath;
      }

      if (!this.store.exampleDoc) {
        return null;
      }

      var component = this.getCommentTag('component').string;
      return component ? _get__('path').resolve(this.store.examplePath, component) : null;
    }
  }]);
  return Illustrator;
}();
// import walk from 'acorn-jsx-walk';


exports.default = Illustrator;

function _getGlobalObject() {
  try {
    if (!!global) {
      return global;
    }
  } catch (e) {
    try {
      if (!!window) {
        return window;
      }
    } catch (e) {
      return this;
    }
  }
}

;
var _RewireModuleId__ = null;

function _getRewireModuleId__() {
  if (_RewireModuleId__ === null) {
    var globalVariable = _getGlobalObject();

    if (!globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__) {
      globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__ = 0;
    }

    _RewireModuleId__ = __$$GLOBAL_REWIRE_NEXT_MODULE_ID__++;
  }

  return _RewireModuleId__;
}

function _getRewireRegistry__() {
  var theGlobalVariable = _getGlobalObject();

  if (!theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__) {
    theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = (0, _create2.default)(null);
  }

  return __$$GLOBAL_REWIRE_REGISTRY__;
}

function _getRewiredData__() {
  var moduleId = _getRewireModuleId__();

  var registry = _getRewireRegistry__();

  var rewireData = registry[moduleId];

  if (!rewireData) {
    registry[moduleId] = (0, _create2.default)(null);
    rewireData = registry[moduleId];
  }

  return rewireData;
}

(function registerResetAll() {
  var theGlobalVariable = _getGlobalObject();

  if (!theGlobalVariable['__rewire_reset_all__']) {
    theGlobalVariable['__rewire_reset_all__'] = function () {
      theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = (0, _create2.default)(null);
    };
  }
})();

var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
var _RewireAPI__ = {};

(function () {
  function addPropertyToAPIObject(name, value) {
    (0, _defineProperty2.default)(_RewireAPI__, name, {
      value: value,
      enumerable: false,
      configurable: true
    });
  }

  addPropertyToAPIObject('__get__', _get__);
  addPropertyToAPIObject('__GetDependency__', _get__);
  addPropertyToAPIObject('__Rewire__', _set__);
  addPropertyToAPIObject('__set__', _set__);
  addPropertyToAPIObject('__reset__', _reset__);
  addPropertyToAPIObject('__ResetDependency__', _reset__);
  addPropertyToAPIObject('__with__', _with__);
})();

function _get__(variableName) {
  var rewireData = _getRewiredData__();

  if (rewireData[variableName] === undefined) {
    return _get_original__(variableName);
  } else {
    var value = rewireData[variableName];

    if (value === INTENTIONAL_UNDEFINED) {
      return undefined;
    } else {
      return value;
    }
  }
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'fs':
      return _fs2.default;

    case 'toRelativeJsPath':
      return _util.toRelativeJsPath;

    case 'dox':
      return _dox2.default;

    case 'parseReactDoc':
      return _reactDocgen.parse;

    case 'path':
      return _path2.default;

    case 'acorn':
      return _acornJsx2.default;

    case 'recast':
      return _recast2.default;
  }

  return undefined;
}

function _assign__(variableName, value) {
  var rewireData = _getRewiredData__();

  if (rewireData[variableName] === undefined) {
    return _set_original__(variableName, value);
  } else {
    return rewireData[variableName] = value;
  }
}

function _set_original__(variableName, _value) {
  switch (variableName) {}

  return undefined;
}

function _update_operation__(operation, variableName, prefix) {
  var oldValue = _get__(variableName);

  var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;

  _assign__(variableName, newValue);

  return prefix ? newValue : oldValue;
}

function _set__(variableName, value) {
  var rewireData = _getRewiredData__();

  if ((typeof variableName === 'undefined' ? 'undefined' : (0, _typeof3.default)(variableName)) === 'object') {
    (0, _keys2.default)(variableName).forEach(function (name) {
      rewireData[name] = variableName[name];
    });
  } else {
    if (value === undefined) {
      rewireData[variableName] = INTENTIONAL_UNDEFINED;
    } else {
      rewireData[variableName] = value;
    }

    return function () {
      _reset__(variableName);
    };
  }
}

function _reset__(variableName) {
  var rewireData = _getRewiredData__();

  delete rewireData[variableName];

  if ((0, _keys2.default)(rewireData).length == 0) {
    delete _getRewireRegistry__()[_getRewireModuleId__];
  }

  ;
}

function _with__(object) {
  var rewireData = _getRewiredData__();

  var rewiredVariableNames = (0, _keys2.default)(object);
  var previousValues = {};

  function reset() {
    rewiredVariableNames.forEach(function (variableName) {
      rewireData[variableName] = previousValues[variableName];
    });
  }

  return function (callback) {
    rewiredVariableNames.forEach(function (variableName) {
      previousValues[variableName] = rewireData[variableName];
      rewireData[variableName] = object[variableName];
    });
    var result = callback();

    if (!!result && typeof result.then == 'function') {
      result.then(reset).catch(reset);
    } else {
      reset();
    }

    return result;
  };
}

var _typeOfOriginalExport = typeof Illustrator === 'undefined' ? 'undefined' : (0, _typeof3.default)(Illustrator);

function addNonEnumerableProperty(name, value) {
  (0, _defineProperty2.default)(Illustrator, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && (0, _isExtensible2.default)(Illustrator)) {
  addNonEnumerableProperty('__get__', _get__);
  addNonEnumerableProperty('__GetDependency__', _get__);
  addNonEnumerableProperty('__Rewire__', _set__);
  addNonEnumerableProperty('__set__', _set__);
  addNonEnumerableProperty('__reset__', _reset__);
  addNonEnumerableProperty('__ResetDependency__', _reset__);
  addNonEnumerableProperty('__with__', _with__);
  addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}

exports.__get__ = _get__;
exports.__GetDependency__ = _get__;
exports.__Rewire__ = _set__;
exports.__set__ = _set__;
exports.__ResetDependency__ = _reset__;
exports.__RewireAPI__ = _RewireAPI__;