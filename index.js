/**
 * Override default set to take into account the relations that are defined. It
 * should not be possible to overwrite a relation with another value.
 *
 * @param {[type]} key     [description]
 * @param {[type]} val     [description]
 * @param {[type]} options [description]
 */
Backbone.Model.prototype.set = (function(parent) {
    return function(key, val, options) {
        let changes = [];
        let attrs = null;
        let result = null;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        if (!options) {
            options = {};
        }

        if (attrs && !options.skipFormatAttributes) {
            changes = this.setRelated(attrs, options);
        }

        result = parent.call(this, attrs, options);

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
    };
})(Backbone.Model.prototype.set);

/**
 * This is a hack for PUTting stuff to the server without
 * a proper with response.
 *
 * @return {Array} Array of changed attributes. This can be used to trigger change:attr events.
 */
Backbone.Model.prototype.setRelated = function(attributes, options) {
    const getModuleFromRelations = function(relations, relation) {
            return relations[relation].module ? relations[relation].module : relations[relation];
        };
    const changes = [];
    let ModelFromRelation = null;

    _.each(_.intersection(_.keys(this.relations), _.keys(attributes)), (relation) => {
        const value = attributes[relation];
        let currentValue = this.get(relation);

        if (typeof value === 'number' ||
            typeof value === 'string' ||
            value === null ||
            value === undefined
        ) {
            if (currentValue instanceof Backbone.Model) {
                currentValue.set('id', value === undefined ? null : value);
                attributes[relation] = currentValue;
            } else if (currentValue === undefined) {
                if (this.relations[relation]) {
                    ModelFromRelation = getModuleFromRelations(this.relations, relation);
                    attributes[relation] = new ModelFromRelation({id: value});
                }
            }
        } else if (value instanceof Backbone.Model) {
            if (currentValue instanceof Backbone.Model) {
                if (!options.replace) {
                    currentValue.set(value.attributes);
                    attributes[relation] = currentValue;
                    changes.push(relation);
                }
            }
        } else if (value instanceof Backbone.Collection) {
            if (!options.replace) {
                if (currentValue instanceof Backbone.Collection) {
                    // The server returns a collection and locally we have a
                    // collection. Reset the local collection to that of
                    // the remote one.
                    // currentValue.reset(value.models);
                    //
                    // Zaico 2015-05-11:
                    // Resetting messes up local join attributes...
                    //
                    // Zaico 2015-05-16 T3106:
                    // Bug with PUT. Locally we have a collection
                    // and we have a "with" set, but the server does
                    // not respond PUTs with a "with" key. This
                    // means locally added items will not be present
                    // in the withCollections which will remove them.
                    // An easy patch would be to set remove to false,
                    // but this is not a fix. The fix would be to
                    // change the PUT response to also include "with".
                    // Comments gaat kapot zonder {remove: false}.
                    // currentValue.set(value.models, {remove: false});
                    currentValue.set(value.models);
                    attributes[relation] = currentValue;
                }
            }
        } else if (Array.isArray(value)) {
            if (currentValue === undefined) {
                ModelFromRelation = getModuleFromRelations(this.relations, relation);
                currentValue = new ModelFromRelation();
            }

            if (currentValue instanceof Backbone.Collection) {
                // The server returns an array and locally we have a
                // collection. Reset the local collection to that of
                // the array. It tries to rebuild the collection
                // with just ids.
                const currentIds = currentValue.pluck('id');
                const diff = _.difference(currentIds, this.extractIds2(value));

                _.each(value, function(maybeId) {
                    // Don't parse, because an add on a collection
                    // triggers a set. If you set parse, then
                    // the collection expects the response to be
                    // either an array or an object with a data
                    // attribute. This is not the case, we just
                    // want to add the id as a model.
                    const optionsWithoutParse = _.omit(options, 'parse');

                    if (_.isObject(maybeId)) {
                        currentValue.add(maybeId, optionsWithoutParse);
                    } else {
                        currentValue.add({id: maybeId}, optionsWithoutParse);
                    }
                });

                // Remove the ones that are removed serverside,
                // but not locally.
                _.each(diff, function(remove) {
                    const m = currentValue.get(remove);

                    if (m) {
                        currentValue.remove(m);
                    }
                });

                attributes[relation] = currentValue;
            }
        }
    });

    return changes;
};

    // /**
    //  * @param  {[type]} attributes [description]
    //  * @param  {[type]} options    [description]
    //  * @return {Array} Array of changed attributes.
    //  */
    // formatAttributes: function (attributes, options) {
    //     this.formatAttributesId(attributes, options);
    //     return this.setRelated(attributes, options);
    // },
    // formatAttributesId: function (attributes) {
    //     if (attributes.id && this.attributesMeta.id === 'int') {
    //         attributes.id = parseInt(attributes.id, 10);
    //     } else if (attributes.id === '') {
    //         attributes.id = null;
    //     }
    // },
