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

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _underscore = __webpack_require__(1);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _backbone = __webpack_require__(2);

	var _backbone2 = _interopRequireDefault(_backbone);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; } /**
	                                                                                                                              * Override the constructor to perhaps create the relations if `createRelations`
	                                                                                                                              * is set to true.
	                                                                                                                              *
	                                                                                                                              * @param {[type]} key     [description]
	                                                                                                                              * @param {[type]} val     [description]
	                                                                                                                              * @param {[type]} options [description]
	                                                                                                                              */

	var BM = _backbone2.default.Model;

	var getClass = function getClass(relations, relation) {
	    return relations[relation].relationClass ? relations[relation].relationClass : relations[relation];
	};

	exports.default = _backbone2.default.Model.extend({
	    /**
	     * If true, create relations defined in the relations key.
	     *
	     * @type {Boolean}
	     */
	    createRelations: true,
	    /**
	     * This can be a object or a function which should return an object.
	     *
	     * @type {Object|Function}
	     */
	    relations: {},
	    constructor: function Constructor(attributes, options) {
	        var _this = this;

	        options || (options = {});
	        var createRelations = options.createRelations !== undefined ? options.createRelations : this.createRelations;
	        var relations = _underscore2.default.result(this, 'relations');

	        // We take attributes directly, because a toJSON call might translate
	        // the model's attributes...
	        var attrs = attributes instanceof BM ? attributes.attributes : attributes;

	        if (createRelations && !_underscore2.default.isEmpty(relations)) {
	            attrs || (attrs = {});

	            // Create all relations for the first time.
	            _underscore2.default.each(relations, function (props, name) {
	                var MRelation = getClass(relations, name);
	                var mRelation = new MRelation();

	                // If you call Model.set() without attributes, Backbone will
	                // create an {undefined: undefined} attribute on your model.
	                if (attrs[name] !== undefined) {
	                    options.relation = name;
	                    _this.setByModelOrCollection(mRelation, attrs[name], options);
	                }

	                attrs[name] = mRelation;
	            });
	        }

	        return BM.call(this, attrs, options);
	    },
	    /**
	     * Convert (key, value, options) to {attrs: attrs, options: options}.
	     *
	     * Model.set has 2 styles in which you can call the function:
	     * - Model.set(key, value, options)
	     * - Model.set(attrs, options)
	     *
	     * This is a helper function to use the Model.set(attrs, options) variant.
	     * Mostly copy-paste from Backbone.
	     *
	     * @return {Object} {attrs: attrs, options: options}
	     */
	    convertAttributes: function convertAttributes(key, val, options) {
	        var attrs = {};

	        if (key === null) return this;

	        // Handle both `"key", value` and `{key: value}` -style arguments.
	        if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
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
	     * Override default set to take into account the relations that are defined.
	     * It should not be possible to overwrite an existing relation with another
	     * value.
	     */
	    set: function set(key, val, options) {
	        var convertedAttributes = this.convertAttributes(key, val, options);
	        var attrs = convertedAttributes.attrs;
	        var result = null;

	        options = convertedAttributes.options;

	        if (!options) {
	            options = {};
	        }

	        // If a backbone model is given, use these attributes instead of setting the model as attribute.
	        // TODO: `attrs instanceof BM` is much better, but weirdly doesn't work in one of our projects yet.
	        if (attrs instanceof BM) {
	            attrs = attrs.attributes;
	        }

	        attrs = this.formatAttributes(attrs, options);

	        // Find all related objects and call set on those objects.
	        var relatedResult = this.setRelated(attrs, options);

	        result = BM.prototype.set.call(this, relatedResult.attributes, options);

	        // This is a copy paste from Backbone.js codebase. Changes made
	        // using setRelated should also be triggered higher up. It
	        // might be better to listen to related models and trigger based
	        // on that than accumulating all changes and iterating over it.
	        //
	        // Trigger all relevant attribute changes.
	        if (!options.silent) {
	            for (var i = 0, l = relatedResult.changes.length; i < l; i++) {
	                this.trigger('change:' + relatedResult.changes[i], this, this.get(relatedResult.changes[i]), options);
	            }
	        }

	        return result;
	    },

	    /**
	     * Format attributes before setting.
	     *
	     * @param  {Object} attrs
	     * @param  {Object} options
	     * @return {Object} Formatted attrs
	     */
	    formatAttributes: function formatAttributes(attrs, options) {
	        // eslint-disable-line no-unused-vars
	        return attrs;
	    },

	    /**
	     * Find attributes that map to a related object and call set on that object.
	     *
	     * @param {Object} attributes
	     * @param {Object} options
	     * @return {Object} {changes: List of attribute keys which have changed, attributes: Attributes without those already processed and still must be set}
	     */
	    setRelated: function setRelated(attributes, options) {
	        var _this2 = this;

	        var changes = [];
	        var omit = [];

	        // Find attributes that map to a relation.
	        _underscore2.default.each(_underscore2.default.intersection(_underscore2.default.keys(_underscore2.default.result(this, 'relations')), _underscore2.default.keys(attributes)), function (relation) {
	            var newValue = attributes[relation];
	            var currentValue = _this2.get(relation);
	            var constructor = getClass(_underscore2.default.result(_this2, 'relations'), relation);

	            // You may need to know which relation we're handeling right now.
	            options.relation = relation;

	            // Create the relation if currentValue isn't the correct instance.
	            // If it is, then call set on the relation.
	            if (!(currentValue instanceof constructor)) {
	                // If the current relation is not defined and a correct instance
	                // is given, set that instance directly.
	                if (newValue instanceof constructor) {
	                    attributes[relation] = newValue;
	                } else {
	                    attributes[relation] = _this2.createRelated(relation, newValue, constructor, options);
	                }

	                changes.push(relation);
	            } else {
	                // The current value is of the correct type. Now proxy the set
	                // operation and let each type decide what to do with newValue.
	                _this2.setByModelOrCollection(currentValue, newValue, options);
	                changes.push(relation);
	                omit.push(relation);
	            }
	        });

	        return {
	            changes: changes,
	            attributes: _underscore2.default.omit(attributes, omit)
	        };
	    },

	    /**
	     * Call set on the related object and let that object decide what to do.
	     *
	     * @param {string} relation The relation identifier.
	     * @param {mixed} value The new value.
	     * @param {Object} options The options to given as an argument to the related set function.
	     */
	    setByModelOrCollection: function setByModelOrCollection(relation, value, options) {
	        if (relation instanceof BM) {
	            this.setByModel(relation, value, options);
	        } else if (relation instanceof _backbone2.default.Collection) {
	            this.setByCollection(relation, value, options);
	        } else {
	            throw new Error('Relation is not a model or collection?');
	        }
	    },

	    /**
	     * Set a value to a model. Here you can format the value before setting it
	     * to the model.
	     *
	     * @param {Backbone.Model} model
	     * @param {mixed} value
	     * @param {mixed} options
	     */
	    setByModel: function setByModel(model, value, options) {
	        // Setting a scalar will be interpreted as settting the id.
	        if (value === undefined || value === null || typeof value === 'string' || typeof value === 'number') {
	            var result = {};
	            result[this.idAttribute] = value;
	            value = result;
	        }
	        model.set(value, options);
	    },

	    /**
	     * Similar to setByModel, but for a Collection.
	     *
	     * @param {Backbone.Collection} collection
	     * @param {mixed} value
	     * @param {mixed} options
	     */
	    setByCollection: function setByCollection(collection, value, options) {
	        if (value instanceof collection.constructor) {
	            collection.set(value.models, options);
	        } else {
	            collection.set(value, options);
	        }
	    },

	    /**
	     * Create a new instance of relation.
	     */
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

	        _underscore2.default.some(keys, function (anotherKey) {
	            if (result === null || result === undefined) {
	                result = undefined;
	                return true;
	            } else if (typeof result.get === 'function') {
	                result = result.get(anotherKey);
	            } else {
	                // Stop looping as soon as there is no result.
	                return true;
	            }
	        });

	        if (result === this) {
	            return undefined;
	        }

	        return result;
	    }
	});

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