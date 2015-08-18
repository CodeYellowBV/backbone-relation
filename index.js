/**
 * Override the constructor to perhaps create the relations if `createRelations`
 * is set to true.
 *
 * @param {[type]} key     [description]
 * @param {[type]} val     [description]
 * @param {[type]} options [description]
 */

// ++++ TEMP HACK to run unit tests ++++
// The unit tests all use Backbone.Model from the global namespace. Here we
// extend the Backbone.Model, but eventually replace Backbone.Model with the
// patched one and run unit test against it.
const BM = Backbone.Model;
const BurhanModel = Backbone.Model.extend({
    createRelations: true,
    relations: {},
    constructor: function Constructor(attributes, options) {
        const attrs = _.defaults({}, attributes);
        let createRelations = this.createRelations;

        // Make sure options takes precedence.
        if (options) {
            createRelations = options.createRelations;
        }

        if (createRelations) {
            _.each(this.relations, function(MRelation, name) {
                attrs[name] = new MRelation(attrs[name], options);
            });
        }

        return BM.call(this, _.isEmpty(attrs) ? attributes : attrs, options);
    },
    /**
     * Returns an object based on key, value. Mostly Copy-paste from Backbone.
     */
    convertAttributes(key, val, options) {
        let attrs = {};

        if (key === null) return this;

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
     * Override default set to take into account the relations that are defined. It
     * should not be possible to overwrite a relation with another value.
     *
     * @param {[type]} key     [description]
     * @param {[type]} val     [description]
     * @param {[type]} options [description]
     */
    set(key, val, options) {
        const convertedAttributes = this.convertAttributes(key, val, options);
        const attrs = convertedAttributes.attrs;
        let changes = [];
        let result = null;

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
            for (let i = 0, l = changes.length; i < l; i++) {
                this.trigger('change:' + changes[i], this, this.get(changes[i]), options);
            }
        }

        return result;
    },
    setRelated(attributes, options) {
        const getModuleFromRelations = function(relations, relation) {
            return relations[relation].module ? relations[relation].module : relations[relation];
        };
        const changes = [];

        _.each(_.intersection(_.keys(this.relations), _.keys(attributes)), (relation) => {
            const newValue = attributes[relation];
            const currentValue = this.get(relation);
            const constructor = getModuleFromRelations(this.relations, relation);

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
                currentValue.set(newValue);
                changes.push(relation);

                delete attributes[relation];
            }
        });

        return changes;
    },
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

        _.each(keys, (anotherKey) => {
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
    },
});

Backbone.Model = BurhanModel;
// ---- TEMP HACK to run unit tests ----
