## 0.3.0
- Allow model with circular models to be used without infinite recursion.
- Support `createRelations` option in the `.set` method (defaulting to the
  value as set in the model constructor). Previously, the option always
  defaulted to true and caused infinite recursion in the presence of circular
  model relations.

## 0.2.2
- Trigger change event if a relation is changed.

## 0.2.1
- Don't use toJSON for copying model attributes, it might translate the attributes incorrectly.

## 0.1.11
- Add current relation to options during setRelated.

## 0.1.10
- Setting scalar on model now sets id.

## 0.1.9
- Fix bug dotting for null values.

## 0.1.8
- Fixed bug which modified original set data.

## 0.1.7
- Fixed bug for double nested relation.

## 0.1.6
- Add `formatAttributes` method where you can provide a custom formatter for attributes before setting.

## 0.1.5
- Setting a relation in the constructor of a model now works.

## 0.1.4
- When setting a Backbone collection, use the models from this collection instead of adding the collection as a model. `mPost.set('writers', cWriter)` will use the same Writer collection instance and add those models to the writers collection.
- Add comments to methods to better describe what they do.

## 0.1.2
- When setting a Backbone model, use the attributes from this model instead of adding the model as an attribute. `mPost.set('author', mAuthor)` will use the same Author model instance.

## 0.1.1
- Fix bug where an empty options object on a model would prevent relations from being added.
