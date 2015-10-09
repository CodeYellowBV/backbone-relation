(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("underscore"), require("backbone"));
	else if(typeof define === 'function' && define.amd)
		define(["underscore", "backbone"], factory);
	else if(typeof exports === 'object')
		exports["backbone-relation"] = factory(require("underscore"), require("backbone"));
	else
		root["backbone-relation"] = factory(root["_"], root["Backbone"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/**
	 * Override the constructor to perhaps create the relations if `createRelations`
	 * is set to true.
	 *
	 * @param {[type]} key     [description]
	 * @param {[type]} val     [description]
	 * @param {[type]} options [description]
	 */

	var _underscore = __webpack_require__(1);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _backbone = __webpack_require__(2);

	var _backbone2 = _interopRequireDefault(_backbone);

	var BM = _backbone2['default'].Model;

	exports['default'] = _backbone2['default'].Model.extend({
	    createRelations: true,
	    relations: {},
	    constructor: function Constructor(attributes, options) {
	        var attrs = _underscore2['default'].defaults({}, attributes);
	        var createRelations = this.createRelations;

	        // Make sure options takes precedence.
	        if (options && options.createRelations !== undefined) {
	            createRelations = options.createRelations;
	        }

	        if (createRelations) {
	            _underscore2['default'].each(_underscore2['default'].result(this, 'relations'), function (MRelation, name) {
	                attrs[name] = new MRelation(attrs[name], options);
	            });
	        }

	        return BM.call(this, _underscore2['default'].isEmpty(attrs) ? attributes : attrs, options);
	    },
	    /**
	     * Returns an object based on key, value. Mostly Copy-paste from Backbone.
	     */
	    convertAttributes: function convertAttributes(key, val, options) {
	        var attrs = {};

	        if (key === null) return this;

	        // Handle both `"key", value` and `{key: value}` -style arguments.
	        if (typeof key === 'object') {
	            attrs = key;
	            options = val;
	        } else {
	            attrs[key] = val;
	        }

	        return {
	            attrs: attrs,
	            options: options
	        };
	    },

	    /**
	     * Override default set to take into account the relations that are defined. It
	     * should not be possible to overwrite a relation with another value.
	     *
	     * @param {[type]} key     [description]
	     * @param {[type]} val     [description]
	     * @param {[type]} options [description]
	     */
	    set: function set(key, val, options) {
	        var convertedAttributes = this.convertAttributes(key, val, options);
	        var attrs = convertedAttributes.attrs;
	        var changes = [];
	        var result = null;

	        options = convertedAttributes.options;

	        if (!options) {
	            options = {};
	        }

	        // if (attrs && !options.skipFormatAttributes) {
	        changes = this.setRelated(attrs, options);
	        // }

	        result = BM.prototype.set.call(this, attrs, options);

	        // This is a copy paste from Backbone.js codebase. Changes made
	        // using setRelated should also be triggered higer up. It
	        // might be better to listen to related models and trigger based
	        // on that than accumulating all changes and iterating over it.
	        //
	        // Trigger all relevant attribute changes.
	        if (!options.silent) {
	            for (var i = 0, l = changes.length; i < l; i++) {
	                this.trigger('change:' + changes[i], this, this.get(changes[i]), options);
	            }
	        }

	        return result;
	    },
	    setRelated: function setRelated(attributes, options) {
	        var _this = this;

	        var getModuleFromRelations = function getModuleFromRelations(relations, relation) {
	            return relations[relation].module ? relations[relation].module : relations[relation];
	        };
	        var changes = [];

	        _underscore2['default'].each(_underscore2['default'].intersection(_underscore2['default'].keys(_underscore2['default'].result(this, 'relations')), _underscore2['default'].keys(attributes)), function (relation) {
	            var newValue = attributes[relation];
	            var currentValue = _this.get(relation);
	            var constructor = getModuleFromRelations(_underscore2['default'].result(_this, 'relations'), relation);

	            // Create the relation if currentValue isn't the correct instance.
	            // If it is, then call set on the relation.
	            if (!(currentValue instanceof constructor)) {
	                // If the current relation is not defined and a correct instance
	                // is given, set that instance directly.
	                if (newValue instanceof constructor) {
	                    attributes[relation] = newValue;
	                } else {
	                    attributes[relation] = _this.createRelated(relation, newValue, constructor, options);
	                }

	                changes.push(relation);
	            } else {
	                currentValue.set(newValue);
	                changes.push(relation);

	                delete attributes[relation];
	            }
	        });

	        return changes;
	    },
	    createRelated: function createRelated(relation, val, constructor, options) {
	        return new constructor(val, options);
	    },
	    /**
	    * Shorthand for getting nested attributes.
	    *
	    * @param {string} key Attribute name in dot notation.
	    * @return {mixed} The value of key if found, undefined otherwise.
	    */
	    dot: function dot(key) {
	        if (typeof key !== 'string') {
	            return undefined;
	        }

	        var keys = key.trim('.').split('.');
	        var result = this;

	        _underscore2['default'].each(keys, function (anotherKey) {
	            if (typeof result !== 'undefined' && typeof result.get === 'function') {
	                result = result.get(anotherKey);
	            } else {
	                result = undefined;
	            }
	        });

	        if (result === this) {
	            return undefined;
	        }

	        return result;
	    }
	});
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }
/******/ ])
});
;