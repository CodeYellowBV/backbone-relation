/**
 * Override the constructor to perhaps create the relations if `createRelations`
 * is set to true.
 *
 * @param {[type]} key     [description]
 * @param {[type]} val     [description]
 * @param {[type]} options [description]
 */
import _ from 'underscore';
import Backbone from 'backbone';

const BM = Backbone.Model;

const getClass = function(relations, relation) {
    return relations[relation].relationClass ? relations[relation].relationClass : relations[relation];
};

export default Backbone.Model.extend({
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
        options || (options = {});
        const createRelations = options.createRelations !== undefined ? options.createRelations : this.createRelations;
        const relations = _.result(this, 'relations');

        // We take attributes directly, because a toJSON call might translate
        // the model's attributes...
        let attrs = attributes instanceof BM ? attributes.attributes : attributes;

        if (createRelations && !_.isEmpty(relations)) {
            attrs || (attrs = {});

            // Create all relations for the first time.
            _.each(relations, (props, name) => {
                const MRelation = getClass(relations, name);
                const mRelation = new MRelation();

                // If you call Model.set() without attributes, Backbone will
                // create an {undefined: undefined} attribute on your model.
                if (attrs[name] !== undefined) {
                    options.relation = name;
                    this.setByModelOrCollection(mRelation, attrs[name], options);
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
    convertAttributes(key, val, options) {
        let attrs = {};

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            attrs[key] = val;
        }

        return {
            attrs,
            options,
        };
    },
    /**
     * Override default set to take into account the relations that are defined.
     * It should not be possible to overwrite an existing relation with another
     * value.
     */
    set(key, val, options) {
        const convertedAttributes = this.convertAttributes(key, val, options);
        let attrs = convertedAttributes.attrs;
        let result = null;

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
        const relatedResult = this.setRelated(attrs, options);

        result = BM.prototype.set.call(this, relatedResult.attributes, options);

        // This is a copy paste from Backbone.js codebase. Changes made
        // using setRelated should also be triggered higher up. It
        // might be better to listen to related models and trigger based
        // on that than accumulating all changes and iterating over it.
        //
        // Trigger all relevant attribute changes.
        if (!options.silent) {
            for (let i = 0, l = relatedResult.changes.length; i < l; i++) {
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
    formatAttributes(attrs, options) { // eslint-disable-line no-unused-vars
        return attrs;
    },
    /**
     * Find attributes that map to a related object and call set on that object.
     *
     * @param {Object} attributes
     * @param {Object} options
     * @return {Object} {changes: List of attribute keys which have changed, attributes: Attributes without those already processed and still must be set}
     */
    setRelated(attributes, options) {
        const changes = [];
        const omit = [];

        // Find attributes that map to a relation.
        _.each(_.intersection(_.keys(_.result(this, 'relations')), _.keys(attributes)), (relation) => {
            const newValue = attributes[relation];
            const currentValue = this.get(relation);
            const constructor = getClass(_.result(this, 'relations'), relation);

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
                    attributes[relation] = this.createRelated(relation, newValue, constructor, options);
                }

                changes.push(relation);
            } else {
                // The current value is of the correct type. Now proxy the set
                // operation and let each type decide what to do with newValue.
                this.setByModelOrCollection(currentValue, newValue, options);
                changes.push(relation);
                omit.push(relation);
            }
        });

        return {
            changes,
            attributes: _.omit(attributes, omit),
        };
    },
    /**
     * Call set on the related object and let that object decide what to do.
     *
     * @param {string} relation The relation identifier.
     * @param {mixed} value The new value.
     * @param {Object} options The options to given as an argument to the related set function.
     */
    setByModelOrCollection(relation, value, options) {
        if (relation instanceof BM) {
            this.setByModel(relation, value, options);
        } else if (relation instanceof Backbone.Collection) {
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
    setByModel(model, value, options) {
        // Setting a scalar will be interpreted as settting the id.
        if (value === undefined || value === null || typeof value === 'string' || typeof value === 'number') {
            const result = {};
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
    setByCollection(collection, value, options) {
        if (value instanceof collection.constructor) {
            collection.set(value.models, options);
        } else {
            collection.set(value, options);
        }
    },
    /**
     * Create a new instance of relation.
     */
    createRelated(relation, val, constructor, options) {
        return new constructor(val, options);
    },
     /**
     * Shorthand for getting nested attributes.
     *
     * @param {string} key Attribute name in dot notation.
     * @return {mixed} The value of key if found, undefined otherwise.
     */
    dot(key) {
        if (typeof key !== 'string') {
            return undefined;
        }

        const keys = key.trim('.').split('.');
        let result = this;

        _.some(keys, (anotherKey) => {
            if (result && typeof result.get === 'function') {
                result = result.get(anotherKey);
            } else {
                result = undefined;
                return true;
            }
        });

        return result;
    },
});
